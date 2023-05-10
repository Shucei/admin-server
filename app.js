const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const router = require('./router')
const app = express()

//socket框架
const WebSocket = require('ws');
const wss = new WebSocket.Server({
  port: 8081
});
require('./utils/socket')(wss)



app.use(express.static(__dirname + '/public'))
const bodyParser = require("body-parser");// 引入前端req.body插件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());// 引入跨域处理
app.use(morgan('dev')) //日志
app.use('/api', router) //引入路由



// 当所有路径都错误时返回404并报错
app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// 出现错误处理
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  // console.log(next);
  res.status(err.status || 500);
  res.json({ error: err.message });
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`服务开启成功! http://localhost:${PORT}`)
})
