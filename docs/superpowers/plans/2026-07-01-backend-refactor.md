# Backend Refactor — Service + Repository Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce service and repository layers so controllers only handle request/response, services own business logic, and repositories own all Prisma calls.

**Architecture:** Request → Controller → Service → Repository → DB. Each module gets two new files (`.service.js` and `.repository.js`). Controllers are rewritten to be thin wrappers. No new features — pure reorganization.

**Tech Stack:** Node.js, Express, Prisma, PostgreSQL

## Global Constraints

- Node.js 18+
- No new npm packages
- Server runs on port 3000
- All existing API behaviour must remain identical after refactor
- Services throw `{ status, message }` plain objects — controllers catch and respond
- No Prisma calls in controllers or services — only in repositories

---

### Task 1: Users Module

**Files:**
- Create: `src/modules/users/users.repository.js`
- Create: `src/modules/users/users.service.js`
- Modify: `src/modules/users/users.controller.js`

**Interfaces:**
- Produces: `usersRepository.findByEmail(email)`, `usersRepository.findById(id)`, `usersRepository.findAll()`, `usersRepository.create(data)`
- Produces: `usersService.createUser(name, email)`, `usersService.getAllUsers()`

- [ ] **Step 1: Create users.repository.js**

```js
const prisma = require('../../lib/prisma')

const findByEmail = (email) => prisma.user.findUnique({ where: { email } })
const findById = (id) => prisma.user.findUnique({ where: { id } })
const findAll = () => prisma.user.findMany()
const create = (data) => prisma.user.create({ data })

module.exports = { findByEmail, findById, findAll, create }
```

- [ ] **Step 2: Create users.service.js**

```js
const usersRepository = require('./users.repository')

const createUser = async (name, email) => {
  if (!name || !email) throw { status: 400, message: 'name and email are required' }
  const existing = await usersRepository.findByEmail(email)
  if (existing) throw { status: 409, message: 'email already in use' }
  return usersRepository.create({ name, email })
}

const getAllUsers = () => usersRepository.findAll()

module.exports = { createUser, getAllUsers }
```

- [ ] **Step 3: Rewrite users.controller.js**

```js
const usersService = require('./users.service')

const createUser = async (req, res) => {
  try {
    const user = await usersService.createUser(req.body.name, req.body.email)
    res.status(201).json(user)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await usersService.getAllUsers()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createUser, getAllUsers }
```

- [ ] **Step 4: Verify with curl**

```bash
curl -s http://localhost:3000/users
# Expected: array of users

curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test_refactor@test.com"}'
# Expected: 201 with user object

curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test_refactor@test.com"}'
# Expected: 409 email already in use
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/users/
git commit -m "refactor: users module — service and repository layers"
```

---

### Task 2: Boards Module

**Files:**
- Create: `src/modules/boards/boards.repository.js`
- Create: `src/modules/boards/boards.service.js`
- Modify: `src/modules/boards/boards.controller.js`

**Interfaces:**
- Consumes: `usersRepository.findById(id)` from Task 1
- Produces: `boardsRepository.findById(id)`, `boardsRepository.findMember(userId, boardId)`, `boardsService.createBoard(name, privacy)`, `boardsService.getOneBoard(id)`, `boardsService.addMember(boardId, userId)`

- [ ] **Step 1: Create boards.repository.js**

```js
const prisma = require('../../lib/prisma')

const create = (data) => prisma.board.create({ data })
const update = (id, data) => prisma.board.update({ where: { id }, data })
const findById = (id) => prisma.board.findUnique({ where: { id } })
const findAll = () => prisma.board.findMany({
  include: {
    members: { include: { user: true } },
    lists: { include: { cards: true } }
  }
})
const findByIdWithDetails = (id) => prisma.board.findUnique({
  where: { id },
  include: {
    members: { include: { user: true } },
    lists: { include: { cards: true } }
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

- [ ] **Step 2: Create boards.service.js**

```js
const boardsRepository = require('./boards.repository')
const usersRepository = require('../users/users.repository')

const createBoard = async (name, privacy) => {
  if (!name) throw { status: 400, message: 'name is required' }
  if (privacy && !['PUBLIC', 'PRIVATE'].includes(privacy)) {
    throw { status: 400, message: 'privacy must be PUBLIC or PRIVATE' }
  }
  const board = await boardsRepository.create({ name, privacy: privacy || 'PUBLIC' })
  return boardsRepository.update(board.id, { url: `/boards/${board.id}` })
}

const getAllBoards = () => boardsRepository.findAll()

const getOneBoard = async (id) => {
  const board = await boardsRepository.findByIdWithDetails(id)
  if (!board) throw { status: 404, message: 'Board not found' }
  return board
}

const updateBoard = async (id, name, privacy) => {
  if (privacy && !['PUBLIC', 'PRIVATE'].includes(privacy)) {
    throw { status: 400, message: 'privacy must be PUBLIC or PRIVATE' }
  }
  const board = await boardsRepository.findById(id)
  if (!board) throw { status: 404, message: 'Board not found' }
  return boardsRepository.update(id, {
    ...(name && { name }),
    ...(privacy && { privacy })
  })
}

const deleteBoard = async (id) => {
  const board = await boardsRepository.findById(id)
  if (!board) throw { status: 404, message: 'Board not found' }
  await boardsRepository.remove(id)
}

const addMember = async (boardId, userId) => {
  if (!userId) throw { status: 400, message: 'userId is required' }
  const board = await boardsRepository.findById(boardId)
  if (!board) throw { status: 404, message: 'Board not found' }
  const user = await usersRepository.findById(userId)
  if (!user) throw { status: 404, message: 'User not found' }
  const existing = await boardsRepository.findMember(userId, boardId)
  if (existing) throw { status: 409, message: 'User is already a member of this board' }
  return boardsRepository.createMember(userId, boardId)
}

module.exports = { createBoard, getAllBoards, getOneBoard, updateBoard, deleteBoard, addMember }
```

- [ ] **Step 3: Rewrite boards.controller.js**

```js
const boardsService = require('./boards.service')

const createBoard = async (req, res) => {
  try {
    const board = await boardsService.createBoard(req.body.name, req.body.privacy)
    res.status(201).json(board)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getAllBoards = async (req, res) => {
  try {
    const boards = await boardsService.getAllBoards()
    res.json(boards)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getOneBoard = async (req, res) => {
  try {
    const board = await boardsService.getOneBoard(parseInt(req.params.id))
    res.json(board)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateBoard = async (req, res) => {
  try {
    const board = await boardsService.updateBoard(parseInt(req.params.id), req.body.name, req.body.privacy)
    res.json(board)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteBoard = async (req, res) => {
  try {
    await boardsService.deleteBoard(parseInt(req.params.id))
    res.json({ message: 'Board deleted' })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const addMember = async (req, res) => {
  try {
    const member = await boardsService.addMember(parseInt(req.params.id), parseInt(req.body.userId))
    res.status(201).json(member)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createBoard, getAllBoards, getOneBoard, updateBoard, deleteBoard, addMember }
```

- [ ] **Step 4: Verify with curl**

```bash
curl -s http://localhost:3000/boards
# Expected: array of boards with members, lists, cards

curl -s http://localhost:3000/boards/1
# Expected: single board with members, lists, cards

curl -s -X POST http://localhost:3000/boards \
  -H "Content-Type: application/json" \
  -d '{"name":"Refactor Test Board"}'
# Expected: 201 with board object including url field
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/boards/
git commit -m "refactor: boards module — service and repository layers"
```

---

### Task 3: Lists Module

**Files:**
- Create: `src/modules/lists/lists.repository.js`
- Create: `src/modules/lists/lists.service.js`
- Modify: `src/modules/lists/lists.controller.js`

**Interfaces:**
- Consumes: `boardsRepository.findById(id)` from Task 2
- Produces: `listsRepository.findById(id)`, `listsRepository.findByIdWithCards(id)`, `listsService.createList(boardId, name)`, `listsService.getOneList(id)`

- [ ] **Step 1: Create lists.repository.js**

```js
const prisma = require('../../lib/prisma')

const create = (data) => prisma.boardList.create({ data })
const findById = (id) => prisma.boardList.findUnique({ where: { id } })
const findByIdWithCards = (id) => prisma.boardList.findUnique({
  where: { id },
  include: { cards: { orderBy: { position: 'asc' } } }
})
const update = (id, data) => prisma.boardList.update({ where: { id }, data })
const remove = (id) => prisma.boardList.delete({ where: { id } })

module.exports = { create, findById, findByIdWithCards, update, remove }
```

- [ ] **Step 2: Create lists.service.js**

```js
const listsRepository = require('./lists.repository')
const boardsRepository = require('../boards/boards.repository')

const createList = async (boardId, name) => {
  if (!name) throw { status: 400, message: 'name is required' }
  const board = await boardsRepository.findById(boardId)
  if (!board) throw { status: 404, message: 'Board not found' }
  return listsRepository.create({ name, boardId })
}

const getOneList = async (id) => {
  const list = await listsRepository.findByIdWithCards(id)
  if (!list) throw { status: 404, message: 'List not found' }
  return list
}

const updateList = async (id, name) => {
  if (!name) throw { status: 400, message: 'name is required' }
  const list = await listsRepository.findById(id)
  if (!list) throw { status: 404, message: 'List not found' }
  return listsRepository.update(id, { name })
}

const deleteList = async (id) => {
  const list = await listsRepository.findById(id)
  if (!list) throw { status: 404, message: 'List not found' }
  await listsRepository.remove(id)
}

module.exports = { createList, getOneList, updateList, deleteList }
```

- [ ] **Step 3: Rewrite lists.controller.js**

```js
const listsService = require('./lists.service')

const createList = async (req, res) => {
  try {
    const list = await listsService.createList(parseInt(req.params.boardId), req.body.name)
    res.status(201).json(list)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getOneList = async (req, res) => {
  try {
    const list = await listsService.getOneList(parseInt(req.params.id))
    res.json(list)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateList = async (req, res) => {
  try {
    const list = await listsService.updateList(parseInt(req.params.id), req.body.name)
    res.json(list)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteList = async (req, res) => {
  try {
    await listsService.deleteList(parseInt(req.params.id))
    res.json({ message: 'List deleted' })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createList, getOneList, updateList, deleteList }
```

- [ ] **Step 4: Verify with curl**

```bash
curl -s http://localhost:3000/lists/1
# Expected: list object with cards array

curl -s -X POST http://localhost:3000/boards/1/lists \
  -H "Content-Type: application/json" \
  -d '{"name":"Refactor Test List"}'
# Expected: 201 with list object
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/lists/
git commit -m "refactor: lists module — service and repository layers"
```

---

### Task 4: Cards Module

**Files:**
- Create: `src/modules/cards/cards.repository.js`
- Create: `src/modules/cards/cards.service.js`
- Modify: `src/modules/cards/cards.controller.js`

**Interfaces:**
- Consumes: `listsRepository.findById(id)` from Task 3, `boardsRepository.findMember(userId, boardId)` from Task 2, `usersRepository.findById(id)` from Task 1
- Produces: `cardsRepository.findById(id)`, `cardsService.createCard(listId, name, description)`, `cardsService.reorderCard(id, afterCardId)`

- [ ] **Step 1: Create cards.repository.js**

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

- [ ] **Step 2: Create cards.service.js**

```js
const cardsRepository = require('./cards.repository')
const listsRepository = require('../lists/lists.repository')
const boardsRepository = require('../boards/boards.repository')
const usersRepository = require('../users/users.repository')

const createCard = async (listId, name, description) => {
  if (!name) throw { status: 400, message: 'name is required' }
  const list = await listsRepository.findById(listId)
  if (!list) throw { status: 404, message: 'List not found' }
  const last = await cardsRepository.findLastInList(listId)
  const position = last ? last.position + 1 : 1.0
  return cardsRepository.create({ name, description: description || null, boardListId: listId, position })
}

const getOneCard = async (id) => {
  const card = await cardsRepository.findByIdWithDetails(id)
  if (!card) throw { status: 404, message: 'Card not found' }
  return card
}

const updateCard = async (id, name, description) => {
  const card = await cardsRepository.findById(id)
  if (!card) throw { status: 404, message: 'Card not found' }
  return cardsRepository.update(id, {
    ...(name && { name }),
    ...(description !== undefined && { description })
  })
}

const deleteCard = async (id) => {
  const card = await cardsRepository.findById(id)
  if (!card) throw { status: 404, message: 'Card not found' }
  await cardsRepository.remove(id)
}

const assignUser = async (cardId, userId) => {
  if (!userId) throw { status: 400, message: 'userId is required' }
  const card = await cardsRepository.findByIdWithList(cardId)
  if (!card) throw { status: 404, message: 'Card not found' }
  const user = await usersRepository.findById(userId)
  if (!user) throw { status: 404, message: 'User not found' }
  const isMember = await boardsRepository.findMember(userId, card.boardList.boardId)
  if (!isMember) throw { status: 400, message: 'User is not a member of this board' }
  return cardsRepository.updateWithUser(cardId, { assignedUserId: userId })
}

const unassignUser = async (id) => {
  const card = await cardsRepository.findById(id)
  if (!card) throw { status: 404, message: 'Card not found' }
  return cardsRepository.update(id, { assignedUserId: null })
}

const moveCard = async (id, targetListId) => {
  if (!targetListId) throw { status: 400, message: 'targetListId is required' }
  const card = await cardsRepository.findByIdWithList(id)
  if (!card) throw { status: 404, message: 'Card not found' }
  const targetList = await listsRepository.findById(targetListId)
  if (!targetList) throw { status: 404, message: 'Target list not found' }
  if (targetList.boardId !== card.boardList.boardId) {
    throw { status: 400, message: 'Cannot move card to a list in a different board' }
  }
  return cardsRepository.update(id, { boardListId: targetListId })
}

const reorderCard = async (id, afterCardId) => {
  const card = await cardsRepository.findById(id)
  if (!card) throw { status: 404, message: 'Card not found' }

  let newPosition

  if (afterCardId === null || afterCardId === undefined) {
    const first = await cardsRepository.findFirstInList(card.boardListId, id)
    newPosition = first ? first.position / 2 : 1.0
  } else {
    const afterCard = await cardsRepository.findById(parseInt(afterCardId))
    if (!afterCard) throw { status: 404, message: 'Reference card not found' }
    if (afterCard.boardListId !== card.boardListId) {
      throw { status: 400, message: 'Reference card is not in the same list' }
    }
    const next = await cardsRepository.findNextAfterPosition(card.boardListId, afterCard.position, id)
    newPosition = next ? (afterCard.position + next.position) / 2 : afterCard.position + 1
  }

  return cardsRepository.update(id, { position: newPosition })
}

module.exports = { createCard, getOneCard, updateCard, deleteCard, assignUser, unassignUser, moveCard, reorderCard }
```

- [ ] **Step 3: Rewrite cards.controller.js**

```js
const cardsService = require('./cards.service')

const createCard = async (req, res) => {
  try {
    const card = await cardsService.createCard(parseInt(req.params.listId), req.body.name, req.body.description)
    res.status(201).json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getOneCard = async (req, res) => {
  try {
    const card = await cardsService.getOneCard(parseInt(req.params.id))
    res.json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateCard = async (req, res) => {
  try {
    const card = await cardsService.updateCard(parseInt(req.params.id), req.body.name, req.body.description)
    res.json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteCard = async (req, res) => {
  try {
    await cardsService.deleteCard(parseInt(req.params.id))
    res.json({ message: 'Card deleted' })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const assignUser = async (req, res) => {
  try {
    const card = await cardsService.assignUser(parseInt(req.params.id), parseInt(req.body.userId))
    res.json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const unassignUser = async (req, res) => {
  try {
    const card = await cardsService.unassignUser(parseInt(req.params.id))
    res.json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const moveCard = async (req, res) => {
  try {
    const card = await cardsService.moveCard(parseInt(req.params.id), parseInt(req.body.targetListId))
    res.json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const reorderCard = async (req, res) => {
  try {
    const afterCardId = req.body.afterCardId !== undefined ? req.body.afterCardId : null
    const card = await cardsService.reorderCard(parseInt(req.params.id), afterCardId)
    res.json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createCard, getOneCard, updateCard, deleteCard, assignUser, unassignUser, moveCard, reorderCard }
```

- [ ] **Step 4: Add reorderCard to cards.routes.js**

Full file content:

```js
const { Router } = require('express')
const { getOneCard, updateCard, deleteCard, assignUser, unassignUser, moveCard, reorderCard } = require('./cards.controller')

const router = Router()

router.get('/:id', getOneCard)
router.put('/:id', updateCard)
router.delete('/:id', deleteCard)
router.put('/:id/assign', assignUser)
router.put('/:id/unassign', unassignUser)
router.put('/:id/move', moveCard)
router.put('/:id/reorder', reorderCard)

module.exports = router
```

- [ ] **Step 5: Verify with curl**

```bash
curl -s http://localhost:3000/cards/1
# Expected: card with assignedUser and boardList

curl -s -X PUT http://localhost:3000/cards/1/assign \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
# Expected: card with assignedUser populated

curl -s -X PUT http://localhost:3000/cards/1/unassign
# Expected: card with assignedUserId: null
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/cards/
git commit -m "refactor: cards module — service and repository layers"
```
