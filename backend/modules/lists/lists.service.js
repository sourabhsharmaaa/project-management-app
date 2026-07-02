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
