const prisma = require('../../lib/prisma')

const create = (data) => prisma.boardList.create({ data })
const findById = (id) => prisma.boardList.findUnique({ where: { id } })
const update = (id, data) => prisma.boardList.update({ where: { id }, data })
const remove = (id) => prisma.boardList.delete({ where: { id } })

module.exports = { create, findById, update, remove }
