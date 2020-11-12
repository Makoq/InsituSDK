

exports.onlineNode=function(req,res,next){
      let WS=req.wsClient  
      WS.send('{ "msg":"connlist" }')
      res.type('application/json')
      WS.on('message', function incoming(data) {
        
        console.log("list",data);
        if(data!=undefined){
            
            res.end(data)
               
        }
      });
}


// 获取对应在线节点处理服务
// 参数 token,type
// 注意将token encode,因为token中含有特殊字符串如+,机器会误以为时两个字符串相加
exports.onlineNodesAllPcs=function(req,res,next){

      let WS=req.wsClient
      console.log(req.query.token)

      let message={
          msg:"AvailablePcs",
          from:'connlist',
          req:'reqService',
          token:req.query.token,
          type:req.query.type
      }
      WS.send(JSON.stringify(message));
      res.type('application/json')
      WS.on('message', function incoming(data) {
        
            res.end(data)
                      
      });
}

exports.excuteProcess=function(req,res,next){

    let WS=req.wsClient
    console.log(req.query.token)
    if(req.query.dataId!=undefined&&req.query.pcsId!=undefined&&req.query.name!=undefined&&req.query.token!=undefined&&req.query.reqUsrOid!=undefined){

    }else{
        
        res.type('application/json').end('"code":-1,"message":"parameters is incomplete!"')
    
    }

    let message={
        msg:"reqPcs",
        dataId:req.query.dataId,
        pcsId:req.query.pcsId,
        params:req.query.params,
        name:req.query.name,
        token:req.query.token,
        reqUsrOid:req.query.reqUsrOid,
        wsId:'connlist'
    }
    
    WS.send(JSON.stringify(message));
     res.type("application/json")
    WS.on('message', function incoming(data) {
      
          
          res.end(data)
                      
    });

}