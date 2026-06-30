const prisma = require('../../lib/prisma')

const createList = async (req, res) => {
  const { boardId } = req.params
  const { name } = req.body

  if (!name) {
    return res.status(400).json({ error: 'name is required' })
  }

  try {
    const board = await prisma.board.findUnique({ where: { id: parseInt(boardId) } })
    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    const list = await prisma.boardList.create({
      data: { name, boardId: parseInt(boardId) }
    })

    res.status(201).json(list)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getOneList = async (req, res) => {
  const { id } = req.params

  try {
    const list = await prisma.boardList.findUnique({
      where: { id: parseInt(id) },
      include: { cards: true }
    })

    if (!list) {
      return res.status(404).json({ error: 'List not found' })
    }

    res.json(list)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const updateList = async (req, res) => {
  const { id } = req.params
  const { name } = req.body

  if (!name) {
    return res.status(400).json({ error: 'name is required' })
  }

  try {
    const list = await prisma.boardList.findUnique({ where: { id: parseInt(id) } })
    if (!list) {
      return res.status(404).json({ error: 'List not found' })
    }

    const updated = await prisma.boardList.update({
      where: { id: parseInt(id) },
      data: { name }
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteList = async (req, res) => {
  const { id } = req.params

  try {
    const list = await prisma.boardList.findUnique({ where: { id: parseInt(id) } })
    if (!list) {
      return res.status(404).json({ error: 'List not found' })
    }

    await prisma.boardList.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'List deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createList, getOneList, updateList, deleteList }
