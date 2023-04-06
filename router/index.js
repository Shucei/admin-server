const express = require('express')
const router = express.Router()
router.use('/user', require('./user'))
router.use('/role', require('./roles'))
module.exports = router
