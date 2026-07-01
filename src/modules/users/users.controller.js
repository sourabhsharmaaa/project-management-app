const usersService = require('./users.service')

const createUser = async (req, res) => {
  try {
    const user = await usersService.createUser(req.body.name, req.body.email)
    res.status(201).json(user)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message })
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await usersService.getAllUsers()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { createUser, getAllUsers }
