const { decrypt } = require("../utils/cycrypto")

const Decrypt=require('../utils/cycrypto.js')

exports.onlineNode=function(req,res,next){
      let WS=req.wsClient  
      WS.send('{ "msg":"connlist" }')
      res.type('application/json')
      let re={
          'online service nodes':[]
      }
      WS.on('message', function incoming(data) {
         
          if(data!="success"&&data!="node offline"){

            
            let obj=JSON.parse(data)
            if(obj.msg=="online"){
                return
            }
            if(obj['list']!=undefined){ 
                obj.list.forEach(el => {
                    let ob={}
                    ob['node']=Decrypt.myDecrypt(el)
                    ob['token']=el
                    if(ob['node']!=''){//过滤portal页面的websocket
                        re['online service nodes'].push(ob)
                    }
                });
                res.end(JSON.stringify(re))
            }
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
        
            if(data=="node offline"){
                res.end('{"code":-1,"message":"node offline"}')
            }else{
                let obj=JSON.parse(data)
                
                if(obj.msg=="online"){
                    return
                }
                if(obj['res']!=undefined&&obj['AvailablePcs']!=undefined){
                    res.end(data)
                }
            } 
                      
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
        if(data=="online"){
            return
        }
        let obj=JSON.parse(data)
        if(obj.msg=="online"){
            return
        }
        if(obj['msg']!=undefined&&obj['msg']=='insitudata'){
          res.end(data)

        }    
    });

}

// 
exports.invokeDistributedPc=function(req,res,next){
    let WS=req.wsClient
    console.log(req.query.token)
    if(req.query.token!=undefined&&req.query.contDtId!=undefined&&req.query.pcsId!=undefined){

    }else{
        res.end("params err")
    }

    let message={
        msg:"invokDisPcs",
        req:true,
        from:'connlist',
        token:req.query.token,
        contDtId:req.query.contDtId,
        pcsId:req.query.pcsId,
        params:req.query.params
    }
    WS.send(JSON.stringify(message));
    res.type('application/json')


    WS.on('message', function incoming(data) {
        
        if(data=="node offline"){
            res.end('{"code":-1,"message":"node offline"}')
        }else{
            let obj=JSON.parse(data)
            if(obj.msg=="online"){
                return
            }
          if(obj['msg']!=undefined&&obj['msg']=='ivkDPcs'){
              res.end(JSON.stringify({
                uid:obj.uid,
                stout:obj.stout
              }))

          }
        }      
    });
}

exports.distributedData=function(req,res,next){
    
}
