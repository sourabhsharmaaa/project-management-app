const listsService = require('./lists.service')

const createList = async (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId)
    const newList = await listsService.createList(boardId, req.body.name)
    res.status(201).json(newList)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateList = async (req, res) => {
  try {
    const listId = parseInt(req.params.id)
    const updatedList = await listsService.updateList(listId, req.body.name)
    res.json(updatedList)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteList = async (req, res) => {
  try {
    const listId = parseInt(req.params.id)
    await listsService.deleteList(listId)
    res.json({ message: 'List deleted' })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createList, updateList, deleteList }
