const { Router } = require('express')
const { getOneList, updateList, deleteList } = require('./lists.controller')

const router = Router()

router.get('/:id', getOneList)
router.put('/:id', updateList)
router.delete('/:id', deleteList)

module.exports = router
