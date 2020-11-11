const express = require('express')
const router=require('./router/router.js')
const app = express()
const port = 3000

const WebSocket = require('ws'); 
// const ws = new WebSocket('ws://111.229.14.128:1708');

//CORS跨域设置
app.all('*', function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "http://localhost:1708");
    res.header('Access-Control-Allow-Origin', '*') // 使用session时不能使用*，只能对具体的ip开放。
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("X-Powered-By", ' 3.2.1')
    if (req.method == "OPTIONS") res.send(200);/*让options请求快速返回*/
    else next();
});

var wsClient = function (req, res, next) {
    req.wsClient = new WebSocket('ws://111.229.14.128:1708');
    next()
}
app.use(wsClient)


// 获取当前在线节点token
app.get('/onlineNodes', router.onlineNodes)

// 获取对应在线节点处理服务
// 参数 token,type
// 注意将token encode

app.get('/onlineNodesAllPcs', router.onlineNodesAllPcs)



app.listen(port, () => console.log(`app run on port ${port}!`))