const boardsService = require('./boards.service')

const createBoard = async (req, res) => {
  try {
    const newBoard = await boardsService.createBoard(req.body.name, req.body.privacy)
    res.status(201).json(newBoard)
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
    const boardId = parseInt(req.params.id)
    const board = await boardsService.getOneBoard(boardId)
    res.json(board)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateBoard = async (req, res) => {
  try {
    const boardId = parseInt(req.params.id)
    const updatedBoard = await boardsService.updateBoard(boardId, req.body.name, req.body.privacy)
    res.json(updatedBoard)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteBoard = async (req, res) => {
  try {
    const boardId = parseInt(req.params.id)
    await boardsService.deleteBoard(boardId)
    res.json({ message: 'Board deleted' })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const addMember = async (req, res) => {
  try {
    const boardId = parseInt(req.params.id)
    const userId = parseInt(req.body.userId)
    const newMember = await boardsService.addMember(boardId, userId)
    res.status(201).json(newMember)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createBoard, getAllBoards, getOneBoard, updateBoard, deleteBoard, addMember }
