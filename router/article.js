const express = require('express')
const router = express.Router()
const ArticleInstance = require('../controller/articleController')
const validator = require('../middleware/validator/Articlevalidator')
const jwt = require('../utils/jwt').verifyToken



router
  .get("/articles", jwt, ArticleInstance.getArticles) // 获取文章列表
  .post("/articles", jwt, ArticleInstance.createArticle) // 创建文章
  .get("/articles/:id", jwt, validator.validatorId, ArticleInstance.getArticleDetail) // 获取文章详情
  .put("/articles/:id", jwt, ArticleInstance.updateArticle) // 更新文章

module.exports = router