const prisma = require('../../lib/prisma')

const create = (data) => prisma.board.create({ data })
const update = (id, data) => prisma.board.update({ where: { id }, data })
const findById = (id) => prisma.board.findUnique({ where: { id } })
const findAll = () => prisma.board.findMany({
  include: {
    members: { include: { user: true } },
    lists: { include: { cards: { orderBy: { position: 'asc' } } } }
  }
})
const findByIdWithDetails = (id) => prisma.board.findUnique({
  where: { id },
  include: {
    members: { include: { user: true } },
    lists: { include: { cards: { orderBy: { position: 'asc' } } } }
  }
})
const remove = (id) => prisma.board.delete({ where: { id } })
const findMember = (userId, boardId) => prisma.boardMember.findUnique({
  where: { userId_boardId: { userId, boardId } }
})
const createMember = (userId, boardId) => prisma.boardMember.create({
  data: { userId, boardId },
  include: { user: true }
})

module.exports = { create, update, findById, findAll, findByIdWithDetails, remove, findMember, createMember }
