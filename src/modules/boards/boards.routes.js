const { Router } = require('express')
const { createBoard, getAllBoards, getOneBoard, updateBoard, deleteBoard, addMember } = require('./boards.controller')

const router = Router()

router.post('/', createBoard)
router.get('/', getAllBoards)
router.get('/:id', getOneBoard)
router.put('/:id', updateBoard)
router.delete('/:id', deleteBoard)
router.post('/:id/members', addMember)

module.exports = router
