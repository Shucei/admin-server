const { Article } = require('../model/MongoTable')
const Message = require('../middleware/Message')

class ArticleInstance {
  static articleController = new ArticleInstance()
  /**
   * 创建文章
   * @param {*} req 
   * @param {*} res 
   */
  async createArticle (req, res) {
    // const { title, content, author, category } = req.body
    try {
      const newArticle = await Article.create(req.body)
      res.status(200).json({ status: 200, message: '创建文章成功', data: newArticle })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }


  /**
   * 更新文章
   * @param {*} req 
   * @param {*} res 
   */
  async updateArticle (req, res) {
    const { id } = req.params
    const { title, content, category } = req.body
    try {
      const article = await Article.findByIdAndUpdate(id, {
        title,
        content,
        category,
        updatedTime: new Date()
      }, { new: true })
      res.status(200).json({ status: 200, message: '更新文章成功', data: article })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }


  /**
   * 查询文章列表
   * @param {*} req 
   * @param {*} res 
   */
  async getArticles (req, res) {
    const { page = 1, pageSize = 10 } = req.query
    const skip = (page - 1) * pageSize
    try {
      const articles = await Article.find().sort({ updatedTime: -1 }).skip(skip).limit(pageSize)
      const total = await Article.countDocuments()
      res.status(200).json({ status: 200, message: '查询文章列表成功', data: { articles, total } })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  /**
   * 查询单篇文章详情
   * @param {*} req 
   * @param {*} res 
   */

  async getArticleDetail (req, res) {
    const { id } = req.params
    try {
      const article = await Article.findById(id)
      res.status(200).json({ status: 200, message: '查询文章详情成功', data: article })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }
}

module.exports = ArticleInstance.articleController

