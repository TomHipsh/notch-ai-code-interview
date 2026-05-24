# Notch AI Chat

Mini chat application for the Notch code interview. The app uses an Express backend, a Vite React frontend, npm workspaces, OpenAI Chat Completions, tool calling for sentiment extraction, and local JSON file persistence.

The original exercise prompt is kept in [task.md](./task.md).

## Features

- Create and resume ongoing conversations.
- Send user messages and receive OpenAI-generated assistant replies.
- Assistant replies are signed with a unique emoji per conversation.
- User messages are scored for sentiment from `0` to `100` using OpenAI tool calling.
- Sentiment scores are persisted and displayed in the UI with red-to-green coloring.
- Conversation names can be edited from the chat header.
- Conversation and message records persist locally as JSON files.

## Requirements

- Node.js 18 or newer
- npm
- OpenAI API key

## Setup

Install all dependencies from the repository root:

```sh
npm install
```

Create `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key
PORT=8000
OPENAI_MODEL=gpt-4o-mini
```

Create `frontend/.env`:

```env
VITE_DEV_SERVER_PORT=5000
```

The local JSON data store lives under:

```txt
backend/data_store/
```

Runtime JSON files are ignored by git.

## Run The App

Start backend and frontend together:

```sh
npm run dev
```

Open the frontend:

```txt
http://localhost:5000
```

The backend runs on:

```txt
http://localhost:8000
```

The frontend proxies `/api` and `/healthCheck` requests to the backend.

## Useful Commands

Install dependencies:

```sh
npm install
```

Run both apps:

```sh
npm run dev
```

Run only the backend:

```sh
npm run dev:backend
```

Run only the frontend:

```sh
npm run dev:frontend
```

Build both workspaces:

```sh
npm run build
```

Build one workspace:

```sh
npm run build:backend
npm run build:frontend
```

Lint the frontend:

```sh
npm run lint
```

Run the compiled backend:

```sh
npm run build:backend
npm run start
```

## API Overview

- `GET /healthCheck`: backend health check
- `GET /api/conversations`: list ongoing conversations
- `POST /api/conversations`: create a conversation
- `GET /api/conversations/:conversationId`: get a conversation with messages
- `PATCH /api/conversations/:conversationId`: update the conversation name
- `GET /api/conversations/:conversationId/messages`: list messages for a conversation
- `POST /api/conversations/:conversationId/messages`: save a user message, generate assistant reply, and persist sentiment

## Workspace Layout

- `backend`: Express API server, OpenAI services, JSON file data store
- `frontend`: Vite React app
- `task.md`: Original interview assignment
