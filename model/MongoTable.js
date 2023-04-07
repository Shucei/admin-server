// 创建表对象，也就是数据
const mongoose = require("mongoose");
const db = require("./index");
const Schema = mongoose.Schema;
const baseModel = require('./baseModel')
// 用户表
const userSchema = new Schema({
  username: { type: String, require: true },//用户名
  password: { type: String, require: true },//密码,select为false查询时不返回
  email: { type: String, require: true },//邮箱
  sex: { type: String, default: "1" },//性别
  birth: { type: Date }, //生日
  phone: { type: String, default: '1300000001' },//手机
  explain: { type: String }, //介绍
  profile: { type: String, default: "user.png" },//头像
  code: { type: String, default: '' },
  label: {
    type: Array,
    default: ['帅气', '腹黑']
  }, // 标签
  roleIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }], // 角色表
  ...baseModel
});

// 角色表（role）
const roles = new Schema({
  name: {
    type: String,
    default: '',
    required: true
  },
  permIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }], //存储权限表id
  description: { type: String, required: true }, // 角色描述
  ...baseModel
})


// 权限表（permission）
const permissionsSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
    required: true
  },
  code: {
    type: String,
    default: '',
    unique: true,
    index: true
  },
  pid: {
    type: String,
    default: '0' //二级权限的pid为父权限的id
  },
  description: {
    type: String,
    default: '' // 权限描述
  }
});

// const rolePermissionSchema = new Schema({
//   role: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Role',
//     required: true
//   },
//   permission: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Permission',
//     required: true
//   }
// });

// const userRoleSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   role: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Role',
//     required: true
//   }
// });

// 文章
const articleSchema = new Schema({
  title: { type: String, required: true }, //文章标题
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 作者名字或 ID
  content: {
    markdown: { type: String, required: true },
    html: { type: String, required: true }
  },//文章内容，可以使用一个子文档来存储，包含 Markdown 和 HTML 格式的内容
  tags: [{ type: String }], //文章标签，可以使用数组来存储。
  ...baseModel,
  voteCount: {
    type: Number,
    default: 0,
    require: true
  }, //赞
  views: { type: Number }, //浏览次数
  status: { type: Number, default: 0 }, // 0-草稿，1-发布
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }]
});

const comments = new Schema({
  content: { type: String, required: true },// 评论内容
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  }, //评论所属文章的 ID，关联 articles 表
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },//评论者ID
  parent_comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }, // 回复的父级评论，如果是对文章的评论则为 null
  ...baseModel
})

// 好友表
const FriendSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //用户id
  friendID: { type: Schema.Types.ObjectId, ref: "User" }, //好友id
  state: { type: String }, //好友状态(0已是好友，1有申请(待同意)，2表示申请方，对方还未同意)
  markname: { type: String }, //备注
  time: {
    type: Date,
  }, //生成时间
  lastTime: { type: Date }, //最后通讯时间
});

// 一对一消息表
const MessageSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //用户id
  friendID: { type: Schema.Types.ObjectId, ref: "User" }, //好友id
  message: { type: String }, //内容
  types: { type: String }, //内容类型(0文字，1图片链接，2音频链接)
  time: { type: Date }, //发送时间
  state: { type: Number }, //消息状态(0已读，1未读)
});

// 群表
const GroupSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //用户id(创建者)
  name: { type: String }, //群名称
  imgurl: { type: String, default: "group.png" }, //群头像
  time: { type: Date }, //创建时间
  notice: { type: String }, //公告
});

//群成员表
const GroupUserSchema = new Schema({
  GroupID: { type: Schema.Types.ObjectId, ref: "Group" }, //群id
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //用户id
  name: { type: String }, //群内名称
  tip: { type: Number, default: 0 }, //未读消息数，0已读读，1未读
  time: { type: Date }, //加入时间
  lastTime: { type: Date }, //最后通讯时间
  shield: { type: String }, //是否屏蔽群消息(0不屏蔽，1屏蔽)
  state: { type: String }, //添加状态(0已经加入群聊，1有申请(待同意)，2表示申请方，对方还未同意)
  userList: { type: Object },
});

//群消息表
const GroupMsgSchema = new Schema({
  GroupID: { type: Schema.Types.ObjectId, ref: "Group" }, //群id
  userID: { type: Schema.Types.ObjectId, ref: "User" }, //用户id
  message: { type: String }, //内容
  types: { type: String }, //内容类型(0文字，1图片链接，2音频链接)
  time: { type: Date }, //发送时间
  tip: { type: Number, default: 0 }, //未读消息数，0已读读，1未读
});


// 将数据模型暴露出去,users即为集合名称
// 如创建的集合名称不带s。则会补上s
module.exports = {
  User: db.model("User", userSchema),
  Friend: db.model("Friend", FriendSchema),
  Message: db.model("Message", MessageSchema),
  Group: db.model("Group", GroupSchema),
  GroupUser: db.model("GroupUser", GroupUserSchema),
  GroupMsg: db.model("GroupMsg", GroupMsgSchema),
  Permission: db.model('Permission', permissionsSchema),
  Role: db.model('Roles', roles),
  Article: db.model('Article', articleSchema),
  Comments: db.model('Comments', comments)
  // RolePermission: db.model('RolePermission', rolePermissionSchema),
  // UserRoleSchema: db.model('UserRoleSchema', userRoleSchema),
}