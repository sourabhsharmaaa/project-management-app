const cardsService = require('./cards.service')

const createCard = async (req, res) => {
  try {
    const card = await cardsService.createCard(parseInt(req.params.listId), req.body.name, req.body.description)
    res.status(201).json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getOneCard = async (req, res) => {
  try {
    const card = await cardsService.getOneCard(parseInt(req.params.id))
    res.json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateCard = async (req, res) => {
  try {
    const card = await cardsService.updateCard(parseInt(req.params.id), req.body.name, req.body.description)
    res.json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteCard = async (req, res) => {
  try {
    await cardsService.deleteCard(parseInt(req.params.id))
    res.json({ message: 'Card deleted' })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const assignUser = async (req, res) => {
  try {
    const card = await cardsService.assignUser(parseInt(req.params.id), parseInt(req.body.userId))
    res.json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const unassignUser = async (req, res) => {
  try {
    const card = await cardsService.unassignUser(parseInt(req.params.id))
    res.json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const moveCard = async (req, res) => {
  try {
    const card = await cardsService.moveCard(parseInt(req.params.id), parseInt(req.body.targetListId))
    res.json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const reorderCard = async (req, res) => {
  try {
    const afterCardId = req.body.afterCardId !== undefined ? req.body.afterCardId : null
    const card = await cardsService.reorderCard(parseInt(req.params.id), afterCardId)
    res.json(card)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createCard, getOneCard, updateCard, deleteCard, assignUser, unassignUser, moveCard, reorderCard }
