const prisma = require('../../lib/prisma')

const findByEmail = (email) => prisma.user.findUnique({ where: { email } })
const findById = (id) => prisma.user.findUnique({ where: { id } })
const findAll = () => prisma.user.findMany()
const create = (data) => prisma.user.create({ data })

module.exports = { findByEmail, findById, findAll, create }
