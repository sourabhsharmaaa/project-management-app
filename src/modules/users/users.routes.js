const { Router } = require('express')
const { createUser, getAllUsers } = require('./users.controller')

const router = Router()

router.post('/', createUser)
router.get('/', getAllUsers)

module.exports = router
