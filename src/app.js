require('dotenv').config()
const express = require('express')
const usersRouter = require('./modules/users/users.routes')
const boardsRouter = require('./modules/boards/boards.routes')
const listsRouter = require('./modules/lists/lists.routes')
const cardsRouter = require('./modules/cards/cards.routes')
const { createList } = require('./modules/lists/lists.controller')
const { createCard } = require('./modules/cards/cards.controller')

const app = express()

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/users', usersRouter)
app.post('/boards/:boardId/lists', createList)
app.post('/lists/:listId/cards', createCard)
app.use('/boards', boardsRouter)
app.use('/lists', listsRouter)
app.use('/cards', cardsRouter)

module.exports = app
