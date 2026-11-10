# Couturia Web

Frontend de la plateforme Couturia (React + Vite + TypeScript).

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS 4 + DaisyUI 5
- Lucide React (icônes)
- React Router

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir l’URL affichée (souvent `http://localhost:5173`).

## Scripts

| Commande        | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Serveur de développement |
| `npm run build` | Build production         |
| `npm run preview` | Prévisualiser le build |
| `npm run lint`  | Linter (oxlint)          |

## Structure

```text
src/
  components/   # UI réutilisable
  layouts/      # Layouts Public / (plus tard Client, Pro, Admin)
  pages/        # Pages
  routes/       # Définition des routes
  features/     # Modules métier
  lib/          # Utilitaires, mock data, client HTTP
```

Les données de l’accueil sont **fictives** (Sprint 1) et seront remplacées par les API.
