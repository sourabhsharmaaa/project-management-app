const { Router } = require('express')
const { createBoard, getAllBoards, getOneBoard, updateBoard, deleteBoard, addMember } = require('./boards.controller')
const { createList } = require('../lists/lists.controller')

const router = Router()

router.post('/', createBoard)
router.get('/', getAllBoards)
router.get('/:id', getOneBoard)
router.put('/:id', updateBoard)
router.delete('/:id', deleteBoard)
router.post('/:id/members', addMember)
router.post('/:boardId/lists', createList)

module.exports = router
