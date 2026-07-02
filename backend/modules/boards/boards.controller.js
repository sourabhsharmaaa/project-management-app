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
