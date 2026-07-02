const { Router } = require('express')
const { createList, updateList, deleteList } = require('./lists.controller')
const { createCard } = require('../cards/cards.controller')

const router = Router()

router.put('/:id', updateList)
router.delete('/:id', deleteList)
router.post('/:listId/cards', createCard)

module.exports = router
