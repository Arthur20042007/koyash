# Koyash frontend

React + Vite single-page app: the landing page, the storytelling and short
questionnaire flows, the skin-type mini-quiz, and the results screen that renders
the recommended cosmetic bag. It talks to the backend `POST /recommend` API.

## Requirements

- Node.js 20+ and npm

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
```

By default the app calls the backend at `http://localhost:8000`. To use a
different API (for example the deployed one), create a `.env` file in this
folder:

```bash
VITE_API_URL=http://localhost:8000
```

Make sure the backend is running (see the root [README](../README.md#running-locally))
or point `VITE_API_URL` at the deployed API.

## Scripts

| Command                 | What it does                         |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start the Vite dev server with HMR   |
| `npm run build`         | Production build into `dist/`        |
| `npm run preview`       | Preview the production build locally |
| `npm run lint`          | Run ESLint                           |
| `npm run format:check`  | Check Prettier formatting            |
| `npm test`              | Run the Vitest unit tests            |
| `npm run test:coverage` | Run tests with a coverage report     |

## Deployment

The frontend is deployed on Railway. Current URLs and the demo video are listed
in the root [README](../README.md#deployment).
