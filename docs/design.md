# Project Management App — Design Document

## Overview

A full-stack Trello-like project management application. The backend is a REST API supporting 4 core resources — Users, Boards, BoardLists, and Cards — with relationships and business rules that mirror real-world project management workflows. The frontend is a React SPA that lets users create boards, manage lists and cards, assign members, and drag cards between lists.

---

## Tech Stack

| Technology | Layer | Purpose | Why I chose it |
|-----------|-------|---------|----------------|
| Node.js + Express 5 | Backend | Web server and routing | Lightweight, fast to build REST APIs |
| Prisma ORM | Backend | Database access | Type-safe queries, automatic cascade deletes, clean schema definition |
| PostgreSQL | Backend | Database | Relational — fits perfectly since all 4 resources are related to each other |
| React 19 | Frontend | UI components | Component model maps naturally to boards, lists, and cards |
| React Router v7 | Frontend | Client-side routing | Declarative routing between Home and Board pages |
| Vite | Frontend | Dev server and bundler | Fast HMR, zero config for React projects |

---

## Database Design

### Entity Relationship

```
User ─────────────── BoardMember ─────────────── Board
                                                    │
                                               BoardList
                                                    │
                                                  Card ──── User (assigned)
```

### Tables

**User**
| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key, auto-increment |
| name | String | Required |
| email | String | Required, unique |
| createdAt | DateTime | Auto-generated |

**Board**
| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key, auto-increment |
| name | String | Required |
| privacy | String | "PUBLIC" or "PRIVATE", defaults to "PUBLIC" |
| url | String | Auto-generated as `/boards/:id` after creation |
| createdAt | DateTime | Auto-generated |

**BoardMember** (join table)
| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key |
| userId | Int | Foreign key → User |
| boardId | Int | Foreign key → Board (cascade delete) |

Unique constraint on `(userId, boardId)` — a user cannot be added to the same board twice.

**BoardList**
| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key, auto-increment |
| name | String | Required |
| boardId | Int | Foreign key → Board (cascade delete) |
| createdAt | DateTime | Auto-generated |

**Card**
| Column | Type | Notes |
|--------|------|-------|
| id | Int | Primary key, auto-increment |
| name | String | Required |
| description | String | Optional |
| boardListId | Int | Foreign key → BoardList (cascade delete) |
| assignedUserId | Int? | Foreign key → User, nullable, defaults to null |
| createdAt | DateTime | Auto-generated |

### Cascade Deletes

Handled at the database level via Prisma schema:
- Delete Board → automatically deletes all its BoardLists and Cards
- Delete BoardList → automatically deletes all its Cards

This means the application code only needs to issue a single delete — the database handles the rest in the correct order.

---

## API Design

### Base URL
`http://localhost:3000`

### Endpoints

**Users**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create a user |
| GET | `/users` | Get all users |

**Boards**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/boards` | Create a board |
| GET | `/boards` | Get all boards |
| GET | `/boards/:id` | Get one board with lists and cards |
| PUT | `/boards/:id` | Update board |
| DELETE | `/boards/:id` | Delete board (cascades) |
| POST | `/boards/:id/members` | Add user to board |

**BoardLists**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/boards/:boardId/lists` | Create a list inside a board |
| PUT | `/lists/:id` | Update list |
| DELETE | `/lists/:id` | Delete list (cascades) |

**Cards**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/lists/:listId/cards` | Create a card inside a list |
| PUT | `/cards/:id` | Update card |
| DELETE | `/cards/:id` | Delete card |
| PUT | `/cards/:id/assign` | Assign user to card |
| PUT | `/cards/:id/unassign` | Unassign user from card |
| PUT | `/cards/:id/move` | Move card to another list |
| PUT | `/cards/:id/reorder` | Reorder card within its list |

---

## Project Structure

```
backend/
  app.js              — Express setup, middleware, all route mounting
  index.js            — Starts the HTTP server
  lib/
    prisma.js         — Single shared Prisma client instance
  modules/
    users/
      users.routes.js
      users.controller.js
      users.service.js
      users.repository.js
    boards/
      boards.routes.js
      boards.controller.js
      boards.service.js
      boards.repository.js
    lists/
      lists.routes.js
      lists.controller.js
      lists.service.js
      lists.repository.js
    cards/
      cards.routes.js
      cards.controller.js
      cards.service.js
      cards.repository.js
frontend/
  index.html          — HTML entry point
  vite.config.js      — Vite config
  src/
    main.jsx          — React entry point
    App.jsx           — Root component and routing
    api/
      index.js        — All backend API calls in one place
    components/
      BoardCard.jsx   — Board preview card on the home page
      List.jsx        — List column with its cards
      Card.jsx        — Draggable card inside a list
    pages/
      Home.jsx        — Board listing page
      Board.jsx       — Board detail with drag-and-drop
prisma/
  schema.prisma       — Database schema
docs/
  api.md              — API reference
  design.md           — This document
```

Each module is self-contained: routes, controller, service, and repository all live in the same folder. If you want to find anything related to boards, you go to the boards folder — nothing else to look at.

---

## Key Business Rules

1. **Board privacy** defaults to `"PUBLIC"` if not provided
2. **Board URL** is auto-generated as `/boards/:id` after creation (requires two DB calls — create then update)
3. **Cards are unassigned** by default (`assignedUserId: null`)
4. **Assigning a user to a card** requires that user to be a member of the board first — enforced in the controller
5. **Moving a card** is only allowed within the same board — validated by comparing `boardId` of source and target lists
6. **Cascade deletes** are handled at the schema level, not in application code

---

## Design Decisions

**Why Prisma over raw SQL?**
Prisma prevents SQL injection by default, handles cascade deletes automatically, and makes relational queries much cleaner. Fetching a board with all its lists and cards is one query with `include` instead of three separate SQL queries that need to be manually stitched together.

**Why modular folder structure?**
Each resource is completely isolated. Routes only define URLs, controllers only contain logic. Adding a new feature to boards means touching only the boards folder — nothing else in the codebase needs to change.

**Why no authentication?**
The assignment focuses on the core domain logic. Authentication would be the natural next layer — a JWT middleware added to `app.js` that validates a token before reaching any route handler.
