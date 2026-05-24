# Notch AI Chat

Mini chat application for the Notch code interview. The project is organized as an npm workspace with separate backend and frontend packages.

The original exercise prompt is kept in [task.md](./task.md).

## Requirements

- Node.js 18 or newer
- npm
- OpenAI API key for the backend

## Setup

Install all workspace dependencies from the repository root:

```sh
npm install
```

Create `backend/.env` with:

```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key
```

## Development

Run the backend and frontend together:

```sh
npm run dev
```

Run one app at a time:

```sh
npm run dev:backend
npm run dev:frontend
```

By default:

- Backend runs on `http://localhost:3000`
- Frontend runs on the Vite dev server URL printed in the terminal

## Build And Checks

Build both workspaces:

```sh
npm run build
```

Lint the frontend:

```sh
npm run lint
```

Build one workspace:

```sh
npm run build:backend
npm run build:frontend
```

## Workspace Layout

- `backend`: Express API server
- `frontend`: Vite React app
- `task.md`: Original interview assignment
