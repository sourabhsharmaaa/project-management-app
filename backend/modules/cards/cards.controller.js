const cardsService = require('./cards.service')

const createCard = async (req, res) => {
  try {
    const listId = parseInt(req.params.listId)
    const newCard = await cardsService.createCard(listId, req.body.name, req.body.description)
    res.status(201).json(newCard)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateCard = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id)
    const updatedCard = await cardsService.updateCard(cardId, req.body.name, req.body.description)
    res.json(updatedCard)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteCard = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id)
    await cardsService.deleteCard(cardId)
    res.json({ message: 'Card deleted' })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const assignUser = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id)
    const userId = parseInt(req.body.userId)
    const updatedCard = await cardsService.assignUser(cardId, userId)
    res.json(updatedCard)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const unassignUser = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id)
    const updatedCard = await cardsService.unassignUser(cardId)
    res.json(updatedCard)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const moveCard = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id)
    const targetListId = parseInt(req.body.targetListId)
    const updatedCard = await cardsService.moveCard(cardId, targetListId)
    res.json(updatedCard)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const reorderCard = async (req, res) => {
  try {
    const cardId = parseInt(req.params.id)
    const afterCardId = req.body.afterCardId !== undefined ? req.body.afterCardId : null
    const updatedCard = await cardsService.reorderCard(cardId, afterCardId)
    res.json(updatedCard)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createCard, updateCard, deleteCard, assignUser, unassignUser, moveCard, reorderCard }
