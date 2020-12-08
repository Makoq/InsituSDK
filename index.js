const express = require('express')
const router=require('./router/router.js')
const app = express()
const port = 8898
var bodyParser = require("body-parser");
const WebSocket = require('ws'); 
// const ws = new WebSocket('ws://111.229.14.128:1708');

// app.use(bodyParser.json());
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
let ws=new WebSocket('ws://111.229.14.128:1708');
ws.on('open',()=>{
    console.log("open websocket connection")
    ws.send('{ "msg":"regist","token":"connlist" }')
    
})
ws.on('close', function close() {
    console.log('disconnected');



});
setInterval(()=>{
    ws.send('{ "msg":"beat" }')
},60000)
ws.on('message',(data)=>{
   
    let obj
    if(data!="success"&&data!="node offline"){
        obj=JSON.parse(data);
        if(obj.msg=='online'){
            console.log('connection with center server is stable')
        }
    } 
})

var wsClient = function (req, res, next) {
    req.wsClient = ws
    next()
}
app.use(wsClient)

app.use(bodyParser.urlencoded({
    extended: false
}));

// 获取当前在线节点token
// 参数 无参数，直接调用
app.get('/onlineNodes', router.onlineNodes)


// 获取对应在线节点处理服务
// 参数 token,type
// 注意将token encode
app.get('/onlineNodesAllPcs', router.onlineNodesAllPcs)


// 执行响应处理方法
// 参数 dataId,pcsId,params,name,token,reqUsrOid
// 注意将token encode
app.get('/extPcs', router.excuteProcess)

// 执行处理方法
// 基于接口调用者提供的数据，调用远程节点接口
// 参数 token,pcsId,contDtId,params,服务节点token标识，处理方法标识pcsId,上传数据容器后返回的标识contDtId,处理方法可能的参数（没有的话可不填）params
app.get('/invokeDistributedPcs',router.invokeDistributedPc)


// 执行处理方法
// 基于模型url
// 参数 token,pcsId,url,params,服务节点token标识，处理方法标识pcsId,外部数据url,处理方法可能的参数（没有的话可不填）params
app.post('/invokeUrlDataPcs',router.invokeUrlDataPcs)


// 分布式节点文件获取
app.get('/fileObtain',router.distributedData)

// 获取文件元数据
app.get('/capability',router.metaInfo)
 

// 测试
app.post('/test',router.test)



app.listen(port, () => console.log(`app run on port ${port}!`))

process.on('uncaughtException', function (err) {
    console.log('Caught Exception:' + err);//直接捕获method()未定义函数，Node进程未被退出。  
});