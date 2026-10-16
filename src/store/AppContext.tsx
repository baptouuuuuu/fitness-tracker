import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { todayKey } from '../domain/dates';
import * as S from '../domain/state';
import { ObjectiveTemplate } from '../domain/templates';
import { AppState, DateKey, emptyState } from '../domain/types';
import { loadState, saveState } from '../storage/persistence';

interface Actions {
  addExercise: (input: S.ExerciseInput) => void;
  updateExercise: (id: string, patch: Partial<S.ExerciseInput & { archived: boolean }>) => void;
  deleteExercise: (id: string) => void;
  addObjective: (input: S.ObjectiveInput) => void;
  updateObjective: (id: string, patch: Partial<S.ObjectiveInput & { archived: boolean }>) => void;
  deleteObjective: (id: string) => void;
  addObjectiveFromTemplate: (t: ObjectiveTemplate) => void;
  setLog: (exerciseId: string, date: DateKey, input: S.LogInput) => void;
  toggleDone: (exerciseId: string, date: DateKey) => void;
}

interface Ctx extends Actions {
  state: AppState;
  ready: boolean;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  const saveChain = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    loadState().then((s) => {
      if (cancelled) return;
      stateRef.current = s;
      setState(s);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const apply = useCallback((fn: (s: AppState) => AppState) => {
    const next = fn(stateRef.current);
    if (next === stateRef.current) return;
    stateRef.current = next;
    setState(next);
    saveChain.current = saveChain.current.then(() => saveState(next)).catch(() => undefined);
  }, []);

  const actions: Actions = {
    addExercise: (i) => apply((s) => S.addExercise(s, i, todayKey())),
    updateExercise: (id, p) => apply((s) => S.updateExercise(s, id, p)),
    deleteExercise: (id) => apply((s) => S.deleteExercise(s, id)),
    addObjective: (i) => apply((s) => S.addObjective(s, i, todayKey())),
    updateObjective: (id, p) => apply((s) => S.updateObjective(s, id, p)),
    deleteObjective: (id) => apply((s) => S.deleteObjective(s, id)),
    addObjectiveFromTemplate: (t) => apply((s) => S.addObjectiveFromTemplate(s, t, todayKey())),
    setLog: (e, d, i) => apply((s) => S.setLog(s, e, d, i)),
    toggleDone: (e, d) => apply((s) => S.toggleDone(s, e, d)),
  };

  return <AppContext.Provider value={{ state, ready, ...actions }}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
