# Project Management App

A Trello-like project management application with a React frontend and a Node.js REST API backend.

## Tech Stack

**Backend**
- **Node.js** + **Express 5** — web server and routing
- **Prisma ORM** — database access with type safety and cascade deletes
- **PostgreSQL** — relational database

**Frontend**
- **React 19** — UI components
- **React Router v7** — client-side routing
- **Vite** — dev server and bundler
- **@dnd-kit** — drag-and-drop for reordering and moving cards between lists
- **CSS Modules** — scoped component styling

## Prerequisites

- Node.js 18+
- PostgreSQL running locally

## Setup

### Backend

1. Install backend dependencies:
   ```bash
   npm install
   ```

2. Copy the example env file and fill in your database credentials:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL username:
   ```
   DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/projectmanagement"
   ```

3. Create the database:
   ```bash
   createdb projectmanagement
   ```

4. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run migrations:
   ```bash
   npx prisma db push
   ```

### Frontend

6. Install frontend dependencies:
   ```bash
   cd frontend && npm install
   ```

## Running the App

**Backend** (from project root):
```bash
npm run dev
```
Server starts at `http://localhost:3000`

**Frontend** (from `frontend/`):
```bash
npm run dev
```
App opens at `http://localhost:5173`

Health check: GET `http://localhost:3000/health`

## API Documentation

See `docs/api.md` for the full API reference with all 18 endpoints.

## Project Structure

```
backend/
  app.js                  — Express setup and route mounting
  index.js                — Server entry point
  lib/
    prisma.js             — Shared Prisma client
  modules/
    users/                — users.routes.js, controller, service, repository
    boards/               — boards.routes.js, controller, service, repository
    lists/                — lists.routes.js, controller, service, repository
    cards/                — cards.routes.js, controller, service, repository
frontend/
  index.html              — HTML entry point
  vite.config.js          — Vite config
  src/
    main.jsx              — React entry point
    App.jsx               — Root component and routing
    api/
      index.js            — All backend API calls in one place
    components/
      BoardCard.jsx       — Board preview card
      BoardCard.module.css
      List.jsx            — List column with cards
      List.module.css
      Card.jsx            — Draggable card
      Card.module.css
    pages/
      Home.jsx            — Board listing page
      Home.module.css
      Board.jsx           — Board detail with drag-and-drop
      Board.module.css
prisma/
  schema.prisma           — Database schema
docs/
  api.md                  — API documentation
```
