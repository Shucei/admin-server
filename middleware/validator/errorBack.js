const { validationResult } = require('express-validator') //校验

module.exports = validator => {
  return async (req, res, next) => {
    await Promise.all(validator.map(validate => validate.run(req)))
    const error = validationResult(req)
    if (!error.isEmpty()) {
      return res.status(401).json({ error: error.array() })
    }
    next()
  }
}