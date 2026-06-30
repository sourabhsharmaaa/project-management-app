const prisma = require('../../lib/prisma')

const createCard = async (req, res) => {
  const { listId } = req.params
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ error: 'name is required' })
  }

  try {
    const list = await prisma.boardList.findUnique({ where: { id: parseInt(listId) } })
    if (!list) {
      return res.status(404).json({ error: 'List not found' })
    }

    const card = await prisma.card.create({
      data: { name, description: description || null, boardListId: parseInt(listId) }
    })

    res.status(201).json(card)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getOneCard = async (req, res) => {
  const { id } = req.params

  try {
    const card = await prisma.card.findUnique({
      where: { id: parseInt(id) },
      include: { assignedUser: true, boardList: true }
    })

    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }

    res.json(card)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateCard = async (req, res) => {
  const { id } = req.params
  const { name, description } = req.body

  try {
    const card = await prisma.card.findUnique({ where: { id: parseInt(id) } })
    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }

    const updated = await prisma.card.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      }
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteCard = async (req, res) => {
  const { id } = req.params

  try {
    const card = await prisma.card.findUnique({ where: { id: parseInt(id) } })
    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }

    await prisma.card.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Card deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const assignUser = async (req, res) => {
  const { id } = req.params
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }

  try {
    const card = await prisma.card.findUnique({
      where: { id: parseInt(id) },
      include: { boardList: true }
    })
    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isMember = await prisma.boardMember.findUnique({
      where: {
        userId_boardId: { userId: parseInt(userId), boardId: card.boardList.boardId }
      }
    })
    if (!isMember) {
      return res.status(400).json({ error: 'User is not a member of this board' })
    }

    const updated = await prisma.card.update({
      where: { id: parseInt(id) },
      data: { assignedUserId: parseInt(userId) },
      include: { assignedUser: true }
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const unassignUser = async (req, res) => {
  const { id } = req.params

  try {
    const card = await prisma.card.findUnique({ where: { id: parseInt(id) } })
    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }

    const updated = await prisma.card.update({
      where: { id: parseInt(id) },
      data: { assignedUserId: null }
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const moveCard = async (req, res) => {
  const { id } = req.params
  const { targetListId } = req.body

  if (!targetListId) {
    return res.status(400).json({ error: 'targetListId is required' })
  }

  try {
    const card = await prisma.card.findUnique({
      where: { id: parseInt(id) },
      include: { boardList: true }
    })
    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }

    const targetList = await prisma.boardList.findUnique({
      where: { id: parseInt(targetListId) }
    })
    if (!targetList) {
      return res.status(404).json({ error: 'Target list not found' })
    }

    if (targetList.boardId !== card.boardList.boardId) {
      return res.status(400).json({ error: 'Cannot move card to a list in a different board' })
    }

    const updated = await prisma.card.update({
      where: { id: parseInt(id) },
      data: { boardListId: parseInt(targetListId) }
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createCard, getOneCard, updateCard, deleteCard, assignUser, unassignUser, moveCard }
