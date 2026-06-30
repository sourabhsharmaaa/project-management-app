const prisma = require('../../lib/prisma')

const createBoard = async (req, res) => {
  const { name, privacy } = req.body

  if (!name) {
    return res.status(400).json({ error: 'name is required' })
  }

  if (privacy && !['PUBLIC', 'PRIVATE'].includes(privacy)) {
    return res.status(400).json({ error: 'privacy must be PUBLIC or PRIVATE' })
  }

  try {
    const board = await prisma.board.create({
      data: { name, privacy: privacy || 'PUBLIC' }
    })

    const updated = await prisma.board.update({
      where: { id: board.id },
      data: { url: `/boards/${board.id}` }
    })

    res.status(201).json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getAllBoards = async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      include: {
        members: { include: { user: true } },
        lists: { include: { cards: true } }
      }
    })
    res.json(boards)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getOneBoard = async (req, res) => {
  const { id } = req.params

  try {
    const board = await prisma.board.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: { include: { user: true } },
        lists: { include: { cards: true } }
      }
    })

    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    res.json(board)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateBoard = async (req, res) => {
  const { id } = req.params
  const { name, privacy } = req.body

  if (privacy && !['PUBLIC', 'PRIVATE'].includes(privacy)) {
    return res.status(400).json({ error: 'privacy must be PUBLIC or PRIVATE' })
  }

  try {
    const board = await prisma.board.findUnique({ where: { id: parseInt(id) } })
    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    const updated = await prisma.board.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(privacy && { privacy })
      }
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteBoard = async (req, res) => {
  const { id } = req.params

  try {
    const board = await prisma.board.findUnique({ where: { id: parseInt(id) } })
    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    await prisma.board.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Board deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const addMember = async (req, res) => {
  const { id } = req.params
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }

  try {
    const board = await prisma.board.findUnique({ where: { id: parseInt(id) } })
    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const existing = await prisma.boardMember.findUnique({
      where: { userId_boardId: { userId: parseInt(userId), boardId: parseInt(id) } }
    })
    if (existing) {
      return res.status(409).json({ error: 'User is already a member of this board' })
    }

    const member = await prisma.boardMember.create({
      data: { userId: parseInt(userId), boardId: parseInt(id) },
      include: { user: true }
    })

    res.status(201).json(member)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createBoard, getAllBoards, getOneBoard, updateBoard, deleteBoard, addMember }
