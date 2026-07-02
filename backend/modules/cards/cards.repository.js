const prisma = require('../../lib/prisma')

const create = (data) => prisma.card.create({ data })
const findById = (id) => prisma.card.findUnique({ where: { id } })
const findByIdWithDetails = (id) => prisma.card.findUnique({
  where: { id },
  include: { assignedUser: true, boardList: true }
})
const findByIdWithList = (id) => prisma.card.findUnique({
  where: { id },
  include: { boardList: true }
})
const update = (id, data) => prisma.card.update({ where: { id }, data })
const updateWithUser = (id, data) => prisma.card.update({
  where: { id },
  data,
  include: { assignedUser: true }
})
const remove = (id) => prisma.card.delete({ where: { id } })
const findLastInList = (boardListId) => prisma.card.findFirst({
  where: { boardListId },
  orderBy: { position: 'desc' }
})
const findFirstInList = (boardListId, excludeId) => prisma.card.findFirst({
  where: { boardListId, id: { not: excludeId } },
  orderBy: { position: 'asc' }
})
const findNextAfterPosition = (boardListId, position, excludeId) => prisma.card.findFirst({
  where: { boardListId, position: { gt: position }, id: { not: excludeId } },
  orderBy: { position: 'asc' }
})

module.exports = {
  create, findById, findByIdWithDetails, findByIdWithList,
  update, updateWithUser, remove,
  findLastInList, findFirstInList, findNextAfterPosition
}
