const usersRepository = require('./users.repository')

const createUser = async (name, email) => {
  if (!name || !email) throw { status: 400, message: 'name and email are required' }
  const existing = await usersRepository.findByEmail(email)
  if (existing) throw { status: 409, message: 'email already in use' }
  return usersRepository.create({ name, email })
}

const getAllUsers = () => usersRepository.findAll()

module.exports = { createUser, getAllUsers }
