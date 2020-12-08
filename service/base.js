const { decrypt } = require("../utils/cycrypto")

const Decrypt=require('../utils/cycrypto.js')
const xml2js =require('xml2js')
const builder=new xml2js.Builder();


exports.onlineNode=function(req,res,next){
      let WS=req.wsClient  
      WS.send('{ "msg":"connlist" }')
      res.type('application/xml')
      let re={
          'onlineServiceNodes':[]
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
                    try{
                        ob['node']=Decrypt.myDecrypt(el['token'])
                    }catch(err){
                        ob['node']=''
                    }
                    ob['token']=el['token']
                    ob['ip']=el['ip']!=undefined?Decrypt.myDecrypt(el['ip']):undefined
                    if(ob['node']!=''){//过滤portal页面的websocket
                        re['onlineServiceNodes'].push(ob)
                    }
                });
                let js={"serviceNodes":re}
                let r=builder.buildObject(js)
                res.end(r)
                // res.end(JSON.stringify(re))
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
      res.type('application/xml')
      WS.on('message', function incoming(data) {
        
            if(data=="node offline"){
                res.end('{"code":-1,"message":"node offline"}')
            }else{
                let obj=JSON.parse(data)
                
                if(obj.msg=="online"){
                    return
                }
                if(obj['res']!=undefined&&obj['AvailablePcs']!=undefined){
                    // obj['res']='This service node has processing services available'
                    delete obj['res']
                    let r=builder.buildObject({'ServicesAvailable':obj})

                    res.end(r)
                }
            } 
                      
      });
}
// 处理服务，数据在节点
exports.excuteProcess=function(req,res,next){

    let WS=req.wsClient
    console.log(req.query.token)
    if(req.query.dataId!=undefined&&req.query.pcsId!=undefined&&req.query.token!=undefined){

    }else{
        res.type('application/json').end('"code":-1,"message":"parameters is incomplete!"')
    }

    let message={
        msg:"reqPcs",
        dataId:req.query.dataId,
        pcsId:req.query.pcsId,
        params:req.query.params!=undefined?req.query.params:undefined,
        name:req.query.name!=undefined?req.query.name:undefined,
        token:req.query.token,
        reqUsrOid:req.query.reqUsrOid!=undefined?req.query.reqUsrOid:undefined,
        wsId:'connlist'
    }
    
    WS.send(JSON.stringify(message));
     res.type("application/xml")
    WS.on('message', function incoming(data) {
        if(data=="online"){
            return
        }
        let obj=JSON.parse(data)
        if(obj.msg=="online"){
            return
        }
        if(obj['msg']!=undefined&&(obj['msg']=='insitudata'||obj['msg']=='pcsErr')){
             
            
            delete obj['msg']

            let r=builder.buildObject({'result':{
                uid:'http://111.229.14.128:8899/data?uid='+obj['id'],
                stout:obj['stout']
            }})

          res.end(r)

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
        params:req.query.params!=undefined?req.query.params:undefined,
        
    }
    WS.send(JSON.stringify(message));
    res.type('application/xml')


    WS.on('message', function incoming(data) {
        
        if(data=="node offline"){
            res.end('{"code":-1,"message":"node offline"}')
        }else{
            let obj=JSON.parse(data)
            if(obj.msg=="online"){
                return
            }
          if(obj['msg']!=undefined&&obj['msg']=='ivkDPcs'){
            let r=builder.buildObject({'result':{
                uid:'http://111.229.14.128:8899/data?uid='+obj.uid,
                stout:obj.stout
              }})

              res.end(r)

          }
        }      
    });
}
// 获取远程节点数据
exports.distributedData=function(req,res,next){
    let WS=req.wsClient

    if(req.query.id!=undefined&&req.query.token!=undefined){
    }else{
        res.end("parameters err")
    }
        let message={
            msg:"req",
            from:'connlist',
            token:req.query.token,
            id:req.query.id,
            name:req.query.name!=undefined?req.query.name:undefined,
            reqUsrOid:req.query.reqUsrOid!=undefined?req.query.reqUsrOid:undefined,
            wsId:'connlist'
        }
        WS.send(JSON.stringify(message));
        res.type('application/xml')
    
    
        WS.on('message', function incoming(data) {
            
            if(data=="node offline"){
                res.end('{"code":-1,"message":"node offline"}')
            }else if(data=="no authority"){
                res.end('{"code":-1,"message":"no authority"}')
            }else if(data=="no data in service node!"){
                res.end('{"code":-1,"message":"no data in service node!"}')
            }else{
                let obj=JSON.parse(data)
                if(obj.msg=="online"){
                    return
                }
              if(obj['msg']!=undefined&&(obj['msg']=='insitudata'||obj['msg']=='pcsErr')){
                let r
                if(obj['msg']=='pcsErr'){
                     r=builder.buildObject(
                        {'error':'data invaild'})
                }else{
                    r=builder.buildObject({
                        'result':{
                        uid:"http://111.229.14.128:8899/data?uid="+obj.id, 
                      }})
                }
                 
    
                  res.end(r)
    
              }
            }      
        });
    
}
exports.invokeUrlDataPcs=function(req,res,next){
    console.log("req url",req.body)
    if(req.body.url!=undefined&&req.body.pcsId!=undefined&&req.body.token!=undefined){
    }else{
        res.end("parameters err")
    }
    let WS=req.wsClient;
    let message={
        msg:"invokDisPcs",
        req:true,
        from:'connlist',
        token:req.body.token,
        url:req.body.url,
        pcsId:req.body.pcsId,
        params:req.body.params!=undefined?req.body.params:undefined,
        
    }
    WS.send(JSON.stringify(message));
    res.type('application/xml')


    WS.on('message', function incoming(data) {
        
        if(data=="node offline"){
            res.end('{"code":-1,"message":"node offline"}')
        }else{
            let obj=JSON.parse(data)
            if(obj.msg=="online"){
                return
            }
          if(obj['msg']!=undefined&&obj['msg']=='ivkDPcs'){
            let r=builder.buildObject({'result':{
                uid:obj.uid!='none'?"http://111.229.14.128:8899/data?uid="+obj.uid:'none',

                stout:obj.stout
              }})

              res.end(r)

          }
        }      
    });



}
exports.metaInfo=function(req,res,next){

    let WS=req.wsClient

    if(req.query.id!=undefined&&req.query.type!=undefined&&req.query.token!=undefined){
    }else{
        res.end("parameters err")
    }
        let message={
            msg:"capability",
            from:'connlist',
             
            token:req.query.token,
            id:req.query.id,
            type:req.query.type,
            // name:req.query.name,
            // reqUsrOid:req.query.reqUsrOid,
            wsId:'connlist'
        }
        WS.send(JSON.stringify(message));
        res.type('application/xml')
    
    
        WS.on('message', function incoming(data) {
            
            if(data=="node offline"){
                res.end('{"code":-1,"message":"node offline"}')
            }else if(data=="no authority"){
                res.end('{"code":-1,"message":"no authority"}')
            }else if(data=="no data in service node!"){
                res.end('{"code":-1,"message":"no data in service node!"}')
            }else{
                let obj=JSON.parse(data)
                if(obj.msg=="online"){
                    return
                }
              if(obj['msg']!=undefined&&(obj['msg']=='capability'||obj['msg']=='pcsErr')){
                let r
                if(obj['msg']=='pcsErr'){
                     r=builder.buildObject(
                        {'error':'data meta invaild'})
                }else{
                    r=builder.buildObject(
                        {
                        Capability:obj.data, 
                      })
                }
                 
    
                  res.end(r)
    
              }
            }      
        });




}
