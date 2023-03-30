const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const router = require('./router')
const app = express()
// 引入跨域处理
const cors = require("cors");
app.use(cors());
// 引入前端req.body插件
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api', router)