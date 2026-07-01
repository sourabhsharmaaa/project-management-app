# Card Ordering — Fractional Indexing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `position` Float field to cards so they can be ordered within a list. Reordering always costs exactly one DB write using fractional indexing.

**Architecture:** Add `position` to the Prisma schema, push the migration, update all card queries to order by position, and expose a `PUT /cards/:id/reorder` endpoint. The backend refactor plan must be complete before starting this plan.

**Tech Stack:** Node.js, Express, Prisma, PostgreSQL

## Global Constraints

- Backend refactor plan must be complete first
- `position` is a Float, not an Integer
- Cards are always returned ordered by `position ASC`
- Reordering costs exactly one DB write (only the moved card's position changes)
- `PUT /cards/:id/move` remains unchanged — it moves between lists, not within a list

---

### Task 1: Add position field to schema and migrate

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add position field to Card model**

In `prisma/schema.prisma`, update the Card model:

```prisma
model Card {
  id             Int      @id @default(autoincrement())
  name           String
  description    String?
  boardListId    Int
  assignedUserId Int?
  position       Float    @default(0)
  createdAt      DateTime @default(now())

  boardList    BoardList @relation(fields: [boardListId], references: [id], onDelete: Cascade)
  assignedUser User?     @relation(fields: [assignedUserId], references: [id])
}
```

- [ ] **Step 2: Push migration**

```bash
npx prisma db push
```

Expected output: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 3: Verify field exists**

```bash
curl -s http://localhost:3000/cards/1
# Expected: card object now includes "position" field
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add position Float field to Card for fractional indexing"
```

---

### Task 2: Order cards by position in all queries

**Files:**
- Modify: `src/modules/cards/cards.repository.js`
- Modify: `src/modules/boards/boards.repository.js`

- [ ] **Step 1: Update cards.repository.js — order cards by position**

Update `findByIdWithDetails` and all list queries to order by position. Full updated file:

```js
const prisma = require('../../lib/prisma')

const create = (data) => prisma.card.create({ data })
const findById = (id) => prisma.card.findUnique({ where: { id } })
const findByIdWithDetails = (id) => prisma.card.findUnique({
  where: { id },
  include: { assignedUser: true, boardList: true }
})
const findByIdWithList = (id) => prisma.card.findUnique({
  where: { id },
  include: { boardList: true }
})
const update = (id, data) => prisma.card.update({ where: { id }, data })
const updateWithUser = (id, data) => prisma.card.update({
  where: { id },
  data,
  include: { assignedUser: true }
})
const remove = (id) => prisma.card.delete({ where: { id } })
const findLastInList = (boardListId) => prisma.card.findFirst({
  where: { boardListId },
  orderBy: { position: 'desc' }
})
const findFirstInList = (boardListId, excludeId) => prisma.card.findFirst({
  where: { boardListId, id: { not: excludeId } },
  orderBy: { position: 'asc' }
})
const findNextAfterPosition = (boardListId, position, excludeId) => prisma.card.findFirst({
  where: { boardListId, position: { gt: position }, id: { not: excludeId } },
  orderBy: { position: 'asc' }
})

module.exports = {
  create, findById, findByIdWithDetails, findByIdWithList,
  update, updateWithUser, remove,
  findLastInList, findFirstInList, findNextAfterPosition
}
```

- [ ] **Step 2: Update boards.repository.js — order cards by position inside lists**

Update `findAll` and `findByIdWithDetails` to order cards by position:

```js
const prisma = require('../../lib/prisma')

const create = (data) => prisma.board.create({ data })
const update = (id, data) => prisma.board.update({ where: { id }, data })
const findById = (id) => prisma.board.findUnique({ where: { id } })
const findAll = () => prisma.board.findMany({
  include: {
    members: { include: { user: true } },
    lists: { include: { cards: { orderBy: { position: 'asc' } } } }
  }
})
const findByIdWithDetails = (id) => prisma.board.findUnique({
  where: { id },
  include: {
    members: { include: { user: true } },
    lists: { include: { cards: { orderBy: { position: 'asc' } } } }
  }
})
const remove = (id) => prisma.board.delete({ where: { id } })
const findMember = (userId, boardId) => prisma.boardMember.findUnique({
  where: { userId_boardId: { userId, boardId } }
})
const createMember = (userId, boardId) => prisma.boardMember.create({
  data: { userId, boardId },
  include: { user: true }
})

module.exports = { create, update, findById, findAll, findByIdWithDetails, remove, findMember, createMember }
```

- [ ] **Step 3: Verify ordering**

```bash
# Create two cards in the same list and verify they come back ordered by position
curl -s http://localhost:3000/lists/1
# Expected: cards array ordered by position ASC
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/cards/cards.repository.js src/modules/boards/boards.repository.js
git commit -m "feat: order cards by position in all queries"
```

---

### Task 3: Wire reorder endpoint

**Files:**
- Verify: `src/modules/cards/cards.service.js` (reorderCard already implemented in refactor plan)
- Verify: `src/modules/cards/cards.controller.js` (reorderCard already implemented in refactor plan)
- Verify: `src/modules/cards/cards.routes.js` (PUT /:id/reorder already added in refactor plan)

- [ ] **Step 1: Verify reorder endpoint works — move to beginning**

First check what cards exist in a list:
```bash
curl -s http://localhost:3000/lists/1
# Note the card IDs and their current positions
```

Move a card to the beginning of the list:
```bash
curl -s -X PUT http://localhost:3000/cards/<id>/reorder \
  -H "Content-Type: application/json" \
  -d '{"afterCardId": null}'
# Expected: card with new position value smaller than the previous first card
```

Verify the list now shows the card first:
```bash
curl -s http://localhost:3000/lists/1
# Expected: reordered card appears first
```

- [ ] **Step 2: Verify reorder endpoint works — move after a specific card**

```bash
curl -s -X PUT http://localhost:3000/cards/<id>/reorder \
  -H "Content-Type: application/json" \
  -d '{"afterCardId": <other_card_id>}'
# Expected: card position is between afterCard.position and the next card's position
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/cards/
git commit -m "feat: PUT /cards/:id/reorder — fractional indexing within a list"
```
