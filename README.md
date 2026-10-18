# Fitness Tracker

Application de suivi de régularité sportive (musculation, étirements, mobilité, cardio…) — **un seul code** pour **web, iOS et Android**, construite avec Expo (React Native), TypeScript et Expo Router.

## Fonctionnalités

- **Exercices** : création / modification / archivage / suppression, catégories libres ou prédéfinies, modèles recommandés.
- **Objectifs** : nom libre ou suggestions, priorité (faible / moyenne / haute), liés à un ou plusieurs exercices.
- **Suivi quotidien** : fait / pas fait par jour, avec commentaire, durée, séries et répétitions. Navigation vers les jours passés.
- **Recommandations** : l'écran « Aujourd'hui » affiche les 5 exercices les plus utiles avec la raison.
- **Statistiques** : régularité hebdomadaire et mensuelle, séries (streaks), calendrier, progression par exercice.
- **Assistant de création** : une conversation en français permet d'ajouter des exercices et objectifs à partir d'une phrase.
- **Hors-ligne** : toutes les données sont stockées localement (aucun service externe).

## Prérequis

- Node.js 20+ et npm

## Installation et lancement

```bash
npm install
npm run web        # navigateur
npm run ios        # simulateur iOS (macOS) ou Expo Go
npm run android    # émulateur Android ou Expo Go
npm start          # menu Expo (QR code pour Expo Go)
```

## Tests et vérifications

```bash
npm test           # tests unitaires + smoke test UI (Jest)
npm run typecheck  # TypeScript
npm run build:web  # export web statique dans dist/
```

## Architecture

```
src/
  app/          Écrans (Expo Router) : (tabs)/index, exercises, objectives, assistant, history, exercise/[id]
  components/   Composants UI
  domain/       Logique pure et testée : types, dates, stats, recommandations, transformations d'état
  storage/      Persistance locale versionnée + migrations
  store/        Contexte React (état + sauvegarde)
__tests__/      Tests Jest
```

L'assistant interprète localement les demandes courantes de création (sans envoyer les messages à un service externe). Il comprend notamment les formulations « Crée un exercice de course à pied » et « Crée un objectif pour faire 10 pompes ».

### Persistance

L'état est sérialisé en JSON dans `@react-native-async-storage/async-storage` (localStorage sur le web, stockage natif sur iOS/Android) sous la forme `{ version, data }`. `src/storage/persistence.ts` contient :
- `SCHEMA_VERSION` et la table `MIGRATIONS` (`n` → `n+1`) pour faire évoluer le schéma sans perdre de données ;
- `sanitize`, qui écarte les enregistrements invalides afin qu'un stockage corrompu ne puisse pas faire planter l'app.

Le choix d'AsyncStorage (plutôt que SQLite) privilégie la fiabilité et la simplicité multiplateforme, notamment sur le web.

### Moteur de recommandation

Pour chaque exercice actif non encore fait le jour concerné, un score de 0 à 100 est calculé (`src/domain/recommendations.ts`) :

| Critère | Poids | Description |
| --- | --- | --- |
| Ancienneté | 30 % | jours depuis la dernière réalisation (plafonné à 14 ; jamais fait = max) |
| Déficit hebdomadaire | 20 % | réalisations sur 7 jours vs cible de 3 / semaine |
| Faible taux de réalisation | 15 % | taux sur 28 jours (ou depuis la création) vs cible |
| Pertinence des objectifs | 25 % | priorité maximale des objectifs actifs liés |
| Équilibre des catégories | 10 % | catégories les moins pratiquées sur 14 jours |

Les égalités sont départagées par nom (résultat déterministe). Les deux raisons principales sont affichées sous forme d'étiquettes.

## Déploiement (GitHub Pages)

Le workflow `.github/workflows/deploy-web.yml` construit et publie la version web à chaque push sur `main` (ou manuellement via *Actions → Deploy web → Run workflow*).
Activation unique : **Settings → Pages → Source : GitHub Actions**. L'app est ensuite disponible sur `https://baptouuuuuu.github.io/fitness-tracker/`.
