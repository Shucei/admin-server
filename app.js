const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const router = require('./router')
const app = express()

app.use(express.static(__dirname + '/public'))
const bodyParser = require("body-parser");// 引入前端req.body插件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());// 引入跨域处理
app.use(morgan('dev')) //日志
app.use('/api', router) //引入路由

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`服务开启成功! http://localhost:${PORT}`)
})
