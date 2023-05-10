const express = require('express')
const router = express.Router()
router.use('/user', require('./user'))
router.use('/role', require('./roles'))
router.use('/article', require('./article'))
router.use('/friend', require('./friends'))
module.exports = router
