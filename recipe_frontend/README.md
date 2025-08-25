# Recipe Explorer Frontend

Modern, minimalistic React UI to browse, search, and view food recipes.

## Features
- Browse recipe catalog with responsive grid
- Search by name, ingredient, or category
- View recipe details in a modal (images, ingredients, steps)
- Favorite and rate recipes (persisted in localStorage)
- Responsive layout for desktop and mobile
- Light theme with color palette:
  - Primary: `#FF7043`
  - Secondary: `#FFA726`
  - Accent: `#8BC34A`

## Getting Started
- `npm start` — run locally at http://localhost:3000
- `npm test` — run tests
- `npm run build` — production build

## Project Structure
- `src/App.js` — main app with components (NavBar, Sidebar, Grid, Modal)
- `src/App.css` — theme variables and component styles
- `src/index.js` — entry point

## Notes
This UI uses in-memory demo data. Favorites and ratings persist client-side in localStorage.
