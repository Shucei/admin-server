const { body } = require('express-validator') //校验
const validate = require('./errorBack') // 统一处理校验
const { Friend, User } = require('../../model/MongoTable')

// bail进行拦截，错了就不需要执行后面
module.exports.createFriend = validate(
  [
    body('userID')
      .notEmpty().withMessage('错误参数')
      .custom(async (userID, { req }) => {
        const friendID = req.body.friendID;
        const result = await Friend.find({
          $or: [
            { userID, friendID },
            { userID: friendID, friendID: userID },
          ]
        });
        if (result.length && result[0].status == '0') {
          return Promise.reject('请勿重复添加~');
        } else {
          return Promise.reject('已是好友~');
        }
      }).bail(),
    body('friendID')
      .notEmpty().withMessage('错误参数').bail()
      .custom(async val => {
        const result = await User.findById(val)
        if (!result) {
          return Promise.reject('账号不存在！')
        }
      })
  ]
)
