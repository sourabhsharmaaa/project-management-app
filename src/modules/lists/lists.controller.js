const listsService = require('./lists.service')

const createList = async (req, res) => {
  try {
    const list = await listsService.createList(parseInt(req.params.boardId), req.body.name)
    res.status(201).json(list)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getOneList = async (req, res) => {
  try {
    const list = await listsService.getOneList(parseInt(req.params.id))
    res.json(list)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateList = async (req, res) => {
  try {
    const list = await listsService.updateList(parseInt(req.params.id), req.body.name)
    res.json(list)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteList = async (req, res) => {
  try {
    await listsService.deleteList(parseInt(req.params.id))
    res.json({ message: 'List deleted' })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createList, getOneList, updateList, deleteList }
