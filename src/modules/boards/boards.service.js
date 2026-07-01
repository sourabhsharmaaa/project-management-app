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
