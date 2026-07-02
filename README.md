# Project Management API

A Trello-like project management backend built with Node.js, Express, Prisma ORM, and PostgreSQL.

## Tech Stack

- **Node.js** + **Express 5** — web server and routing
- **Prisma ORM** — database access with type safety and cascade deletes
- **PostgreSQL** — relational database

## Prerequisites

- Node.js 18+
- PostgreSQL running locally

## Setup

1. Install dependencies:
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

5. Create tables (run this SQL via psql):
   ```bash
   npx prisma db push
   ```

## Running the App

```bash
npm run dev
```

Server starts at `http://localhost:3000`

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
      List.jsx            — List column with cards
      Card.jsx            — Draggable card
    pages/
      Home.jsx            — Board listing page
      Board.jsx           — Board detail with drag-and-drop
prisma/
  schema.prisma           — Database schema
docs/
  api.md                  — API documentation
```
