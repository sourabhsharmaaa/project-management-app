const prisma = require('../../lib/prisma')

const createUser = async (req, res) => {
  const { name, email } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(409).json({ error: 'email already in use' })
  }

  const user = await prisma.user.create({ data: { name, email } })

  res.status(201).json(user)
}

const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
}

module.exports = { createUser, getAllUsers }
