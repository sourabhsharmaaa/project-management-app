const { Router } = require('express')
const { getOneCard, updateCard, deleteCard, assignUser, unassignUser, moveCard } = require('./cards.controller')

const router = Router()

router.get('/:id', getOneCard)
router.put('/:id', updateCard)
router.delete('/:id', deleteCard)
router.put('/:id/assign', assignUser)
router.put('/:id/unassign', unassignUser)
router.put('/:id/move', moveCard)

module.exports = router
