const { decrypt } = require("../utils/cycrypto")

const Decrypt=require('../utils/cycrypto.js')
const xml2js =require('xml2js');
const { ELOOP } = require("constants");
const builder=new xml2js.Builder();


exports.onlineNode=function(req,res,next){

      let WS=req.wsClient  
      WS.send('{ "msg":"connlist" }')
      let respType=true
      if(req.headers['content-type']=='application/json'){
          res.type('application/json')
          respType=false
      }else{
          res.type('application/xml')
  
      }
      let re={
          'onlineServiceNode':[]
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
                        re['onlineServiceNode'].push(ob)
                    }
                });
                let js={"code":0,"serviceNodes":re}
                if(!respType){
                  res.end(JSON.stringify(js))
                }else{
                  let r=builder.buildObject(js)
                  res.end(r)
                }
            }else{
                if(!respType){
                    res.end(JSON.stringify({code:-1}))
                  }else{
                    let r=builder.buildObject({code:-1})
                    res.end(r)
                  }
            }
        }
      });
}

exports.state=function(req,res,next){
    let WS=req.wsClient
    
    let message={
        msg:'state',
        token:undefined
    }
    res.type('application/json')
    try{
        if(decodeURIComponent(req.query.token)!=undefined){
            message.token=decodeURIComponent(req.query.token)
        } else{
            message.token=req.query.token
        }
    }catch(err){
        res.send('{"code":-1,"message":"parameter error"}')
    }
   console.log(message)
    WS.send(JSON.stringify(message));
   
    WS.on('message', function incoming(data) {
      
          if(data=="1"){
              res.end('{"code":0,"message":"online"}')
          }else if(data=="0"){
              res.end('{"code":-1,"message":"node offline"}')
          }   
                    
    });
}

// 获取对应在线节点处理服务
// 参数 token,type
// 注意将token encode,因为token中含有特殊字符串如+,机器会误以为时两个字符串相加
exports.onlineNodesAllPcs=function(req,res,next){

      let WS=req.wsClient
     

      let message={
          msg:"AvailablePcs",
          from:'connlist',
          req:'reqService',
          token:req.query.token,
          type:req.query.type
      }
      let respType=true
        if(req.headers['content-type']=='application/json'){
            res.type('application/json')
            respType=false
        }else{
            res.type('application/xml')

        }
      	 
    try{
        if(decodeURIComponent(req.query.token)!=undefined){
            message.token=decodeURIComponent(req.query.token)
        } else{
            message.token=req.query.token
        }
    }catch(err){
        let err2=builder.buildObject({'result':{
            'code':'-1',
            'mssage':err,
            }
        })
        res.end(err2)
    }
      WS.send(JSON.stringify(message));

      WS.on('message', function incoming(data) {
            console.log
            if(data=="node offline"){
                 
                    res.end(JSON.stringify({"code":-1,"message":"node offline"}))
               
               
            }else{
                let obj=JSON.parse(data)
                
                if(obj.msg=="online"){
                    return
                }
                if(obj['res']!=undefined&&obj['AvailablePcs']!=undefined){
                    // obj['res']='This service node has processing services available'
                    delete obj['res']
                    

                    if(!respType){
                        obj['availablePcs']=obj['AvailablePcs']
                        delete obj['AvailablePcs']
                        res.end(JSON.stringify({"code":0,'servicesAvailable':obj}))
                      }else{
                        let r=builder.buildObject({'servicesAvailable':obj})
                        res.end(r)
                      }
                }
            } 
                      
      });
      return
}
// 处理服务，数据在节点
exports.excuteProcess=function(req,res,next){

    let WS=req.wsClient
 
    if(req.query.dataId!=undefined&&req.query.pcsId!=undefined&&req.query.token!=undefined){

    }else{
        res.send({"code":-1,"message":"parameters is incomplete!"});
        return
    }
	 
    let message={
        msg:"reqPcs",
        dataId:req.query.dataId,
        pcsId:req.query.pcsId,
        params:req.query.params!=undefined?req.query.params:undefined,
        name:req.query.name!=undefined?req.query.name:undefined,
 
        reqUsrOid:req.query.reqUsrOid!=undefined?req.query.reqUsrOid:undefined,
        wsId:'connlist'
    }
 

        let respType=true
        if(req.headers['content-type']=='application/json'){
            res.type('application/json')
            respType=false
        }else{
            res.type('application/xml')

        }
        console.log('exe')
	 
    try{
        if(decodeURIComponent(req.query.token)!=undefined){
            message.token=decodeURIComponent(req.query.token)
        } else{
            message.token=req.query.token
        }
    }catch(err){
        if(!respType){
            res.end(JSON.stringify({"code":-1,"message":err}))
        }else{
            let err2=builder.buildObject({'result':{
                'code':'-1',
                'mssage':err,
                }
            })
            res.end(err2)
        }
      
    }


    try{
    
    WS.send(JSON.stringify(message));
	
    WS.on('message', function incoming(data) {

        console.log(data)
        if(data=="online"){
            return
        }
		if(data=="node offline"){
             
            res.end(JSON.stringify({"code":-1,"message":"node offline"}))
             
        }else{
            
		 
            let obj=JSON.parse(data)
             
            if(obj.msg=="online"){
                return
            }else
            if(obj['msg']!=undefined&&(obj['msg']=='insitudata'||obj['msg']=='pcsErr')){
                console.log("sdsdsd",obj)
                let r
                if(obj['msg']=='pcsErr'){
                    delete obj['msg']
                    if(!respType){
                        res.end(JSON.stringify({"code":-1,"message":obj['stoutErr']}))
                        return
                    }else{
                        r=builder.buildObject({'result':{
                        
                            stout:obj['stoutErr']
                        }})
                        res.end(r)
                        return
                    }
                    
                }else{
               
                    delete obj['msg']
                    if(!respType){
                        res
                        .end( JSON.stringify(
                            {
                                "code":0,
                                'result':{
                                            uid:'http://111.229.14.128:8899/data?uid='+obj['id'],
                                            stout:obj['stout']
                                        }
                            })
                         )
                        return
                    }else{
                        console.log("ok",obj)
                        r=builder.buildObject({'result':{
                            uid:'http://111.229.14.128:8899/data?uid='+obj['id'],
                            stout:obj['stout']
                        }})
                        res.end(r)
                        return
                    }
                     

                }
            } 
        }
        
    });
    }catch(err){
        res.end( {"code":-1,"message":err})
        return
    }

}

// 
exports.invokeDistributedPc=function(req,res,next){
    let WS=req.wsClient
  
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
    
    let respType=true
    
    if(req.headers['content-type']=='application/json'){
        res.type('application/json')
        respType=false
    }else{
        res.type('application/xml')

    }

    try{
        if(decodeURIComponent(req.query.token)!=undefined){
            message.token=decodeURIComponent(req.query.token)
        } else{
            message.token=req.query.token
        }
    }catch(err){

        if(!respType){
            res.end(JSON.stringify({code:-1,err:err}))
        }else{
            let err2=builder.buildObject({'result':{
                'code':'-1',
                'mssage':err,
                }
            })
            res.end(err2)
        }
        
    }
    WS.send(JSON.stringify(message));
    WS.on('message', function incoming(data) {
        
        if(data=="node offline"){
            if(!respType){
                res.end(JSON.stringify({"code":-1,"message":"node offline"}))
            }else{  
                res.end('{"code":-1,"message":"node offline"}')
            }
            
        }else{
            let obj=JSON.parse(data)
            if(obj.msg=="online"){
                return
            }
          if(obj['msg']!=undefined&&obj['msg']=='ivkDPcs'){
            console.log(obj)
            if(!respType){
                if(obj.uid=='none'){
                    res.end(JSON.stringify({code:-1,'err': "failed"}))
                }else{
                    res.end(JSON.stringify({code:0,'result':{
                        uid:'http://111.229.14.128:8899/data?uid='+obj.uid,
                        stout:obj.stout
                    }}))
                }
                    
            }else{
                let r=builder.buildObject({'result':{
                    uid:'http://111.229.14.128:8899/data?uid='+obj.uid,
                    stout:obj.stout
                  }})
    
                  res.end(r)
            }

              

          }
        }      
    });
    return
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

        // res.type('application/xml')
        let respType=true
        if(req.headers['content-type']=='application/json'){
            res.type('application/json')
            respType=false
        }else{
            res.type('application/xml')

        }
    
        try{
            if(decodeURIComponent(req.query.token)!=undefined){
                message.token=decodeURIComponent(req.query.token)
            } else{
                message.token=req.query.token
            }
        }catch(err){
            if(!respType){
                res.end(JSON.stringify({code:-1,err:err}))
            }else{
                let err2=builder.buildObject({'result':{
                    'code':'-1',
                    'mssage':err,
                    }
                })
                res.end(err2)
            }
           
        }
        WS.send(JSON.stringify(message));

        WS.on('message', function incoming(data) {
            
            if(data=="node offline"){
                res.end(JSON.stringify({"code":-1,"message":"node offline"}))
            }else if(data=="no authority"){
                res.end(JSON.stringify({"code":-1,"message":"no authority"}))
            }else if(data=="no data in service node!"){
                res.end(JSON.stringify({"code":-1,"message":"no data in service node!"}))
            }else{
                let obj=JSON.parse(data)
                if(obj.msg=="online"){
                    return
                }
              if(obj['msg']!=undefined&&(obj['msg']=='insitudata'||obj['msg']=='pcsErr')){
                let r
                console.log('ss',obj)
                if(obj['msg']=='pcsErr'){
                    if(!respType){
                        res.end(JSON.stringify({code:-1,err:obj['stoutErr']!=undefined?obj['stoutErr']:"execute err"}))
                    }else{
                        r=builder.buildObject(
                            {'error':'data invaild'})
                        res.end(r)  
                    }
                    
                }else{

                    if(!respType){
                        res.end(JSON.stringify({code:0, 'result':{
                            uid:"http://111.229.14.128:8899/data?uid="+obj.id, 
                          }}))

                    }else{
                        r=builder.buildObject({
                            'result':{
                            uid:"http://111.229.14.128:8899/data?uid="+obj.id, 
                          }})
                        res.end(r)

                    }

                   
                }
    
    
              }
            }      
        });
    return
}
// 获取多个数据url返回值
exports.distributedFiles=function(req,res,next){
    let WS=req.wsClient

    if(req.query.id!=undefined&&req.query.token!=undefined){
    }else{
        res.end("parameters err")
    }
        let message={
            msg:"reqUrls",
            from:'connlist',
            token:req.query.token,
            id:req.query.id,
            name:req.query.name!=undefined?req.query.name:undefined,
            reqUsrOid:req.query.reqUsrOid!=undefined?req.query.reqUsrOid:undefined,
            wsId:'connlist'
        }
        res.type('application/json')
    
        try{
            if(decodeURIComponent(req.query.token)!=undefined){
                message.token=decodeURIComponent(req.query.token)
            } else{
                message.token=req.query.token
            }
        }catch(err){
            // let err2=builder.buildObject({'result':{
            //     'code':'-1',
            //     'mssage':err,
            //     }
            // })

            res.end(JSON.stringify({code:-1,err:err}))
        }
        WS.send(JSON.stringify(message));

        WS.on('message', function incoming(data) {
            console.log("2310",data)
            
            if(data=="node offline"){
                res.end(JSON.stringify({"code":-1,"message":"node offline"}))
            }else if(data=="no authority"){
                res.end(JSON.stringify({"code":-1,"message":"no authority"}))
            }else if(data=="no data in service node!"){
                res.end(JSON.stringify({"code":-1,"message":"no data in service node!"}))
            }else{
                let obj=JSON.parse(data)
                if(obj.msg=="online"){
                    return
                }
                console.log("545",data,obj)
              if(obj['msg']!=undefined&&(obj['msg']=='insitudata'||obj['msg']=='pcsErr')){

                if(obj['msg']=='pcsErr'){
                     res.end(JSON.stringify({'code':-1,'error':'error'}))
               }else{

                    for(let it of obj.id){
                        it.url="http://221.226.60.2:8082/data/"+it.id
                        delete it.id
                    }
                    obj["code"]=0
                    res.end(JSON.stringify(obj))
               }
              }
            }      
        });
    return

}

exports.invokeUrlDataPcs=function(req,res,next){
    
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
    res.type('application/json')
	console.log(req.body.token)
    try{
            if(decodeURIComponent(req.body.token)!=undefined){
                message.token=decodeURIComponent(req.body.token)
            } else{
                message.token=req.body.token
            }
        }catch(err){
            // let err2=builder.buildObject({'result':{
            //     'code':'-1',
            //     'mssage':err,
            //     }
            // })

            
            res.end(JSON.stringify({code:-1,err:err}))
        }
    WS.send(JSON.stringify(message));

    WS.on('message', function incoming(data) {
        console.log(data)
        if(data=="node offline"){
            
            
            // let r=builder.buildObject({'result':'{"code":-1,"message":"node offline"}'})

            res.end(JSON.stringify({"code":-1,"message":"node offline"}))
        }else{
            let obj=JSON.parse(data)
            if(obj.msg=="online"){
                return
            }
          if(obj['msg']!=undefined&&obj['msg']=='ivkDPcs'){

            res.end(JSON.stringify({"code":-1,'result':{
                uid:obj.uid!='none'?"http://111.229.14.128:8899/data?uid="+obj.uid:'none',

                stout:obj.stout
              }}))
            // xml的返回值
            // let r=builder.buildObject({"code":-1,'result':{
            //     uid:obj.uid!='none'?"http://111.229.14.128:8899/data?uid="+obj.uid:'none',

            //     stout:obj.stout
            //   }})

            //   res.end(r)

          }
        }      
    });
    return

}
// 多url时的数据处理调用
exports.invokeUrlsDataPcs=function(req,res,next){
    console.log(req.body)
    if(req.body.urls!=undefined&&req.body.pcsId!=undefined&&req.body.token!=undefined){
    }else{
        res.type('application/json').end("{'code':-1,'msg':'parameters err'}")
    }
    let WS=req.wsClient;
    let message={
        msg:"invokDisPcs",
        req:true,
        from:'connlist',
        token:req.body.token,
        urls:req.body.urls,
        pcsId:req.body.pcsId,
        params:req.body.params!=undefined?req.body.params:undefined,
        
    }
  
    let respType=true
    res.type('application/json')
	console.log(req.body.token)
    try{
            if(decodeURIComponent(req.body.token)!=undefined){
                message.token=decodeURIComponent(req.body.token)
            } else{
                message.token=req.body.token
            }
        }catch(err){
            // let err2=builder.buildObject({'result':{
            //     'code':'-1',
            //     'mssage':err,
            //     }
            // })
            res.end(JSON.stringify({code:-1,err:err}))
        }
         
    WS.send(JSON.stringify(message));

    WS.on('message', function incoming(data) {
         
        if(data=="node offline"){
           
            res.end(JSON.stringify({"code":-1,"message":"node offline"}))
        }else{
            let obj=JSON.parse(data)
            if(obj.msg=="online"){
                return
            }
          if(obj['msg']!=undefined&&obj['msg']=='ivkDPcs'){
              if(obj.uid=='none'){
                res.end(JSON.stringify({"code":-1,mssage:'err'}))
              }else{
                res.end(JSON.stringify({"code":0,'url':obj.uid!='none'?"http://111.229.14.128:8899/data?uid="+obj.uid:'none'}))

              }
          
          }
        }      
    });
    return

}

exports.invokeExternalUrlsDataPcs=function(req,res,next){

    if(req.body.urls!=undefined&&req.body.pcsId!=undefined&&req.body.token!=undefined){
    }else{
        res.end("parameters err")
    }
    let WS=req.wsClient;
    let message={
        msg:"invokDisPcs",
        req:true,
        from:'connlist',
        token:req.body.token,
        ExternalUrls:req.body.urls,
        pcsId:req.body.pcsId,
        params:req.body.params!=undefined?req.body.params:undefined,
        
    }
    res.type('application/json')
	 
    try{
            if(decodeURIComponent(req.body.token)!=undefined){
                message.token=decodeURIComponent(req.body.token)
            } else{
                message.token=req.body.token
            }
        }catch(err){
             
            res.end(JSON.stringify(
                {
                'code':'-1',
                'mssage':err,
                })
            )
            return
        }
    WS.send(JSON.stringify(message));

    WS.on('message', function incoming(data) {
        
        if(data=="node offline"){
            res.end(JSON.stringify({"code":-1,"message":"node offline"}))
        }else{
            let obj=JSON.parse(data)
            if(obj.msg=="online"){
                return
            }
          if(obj['msg']!=undefined&&obj['msg']=='ivkDPcs'){
            if(obj.uid=='none'){
                res.end(JSON.stringify({"code":-1,mssage:'err'}))
              }else{
                 console.log("1.8",obj.uid)
               
                res.end(JSON.stringify({code:0,"uid":obj.uid}))
            }

          }
        }      
    });
    return
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
        let respType=true
        if(req.headers['content-type']=='application/json'){
            res.type('application/json')
            respType=false
        }else{
            res.type('application/xml')

        }

        try{
            if(decodeURIComponent(req.query.token)!=undefined){
                message.token=decodeURIComponent(req.query.token)
            } else{
                message.token=req.query.token
            }
        }catch(err){
            let err2=builder.buildObject({'result':{
                'code':'-1',
                'mssage':err,
                }
            })
            res.end(err2)
        }

        WS.send(JSON.stringify(message));
        
        WS.on('message', function incoming(data) {
            
            if(data=="node offline"){
                res.end(JSON.stringify({"code":-1,"message":"node offline"}))
            }else if(data=="no authority"){
                res.end(JSON.stringify({"code":-1,"message":"no authority"}))
            }else if(data=="no data in service node!"){
                res.end(JSON.stringify({"code":-1,"message":"no data in service node!"}))
            }else{
                let obj=JSON.parse(data)
                if(obj.msg=="online"){
                    return
                }
              if(obj['msg']!=undefined&&(obj['msg']=='capability'||obj['msg']=='pcsErr')){
                let r
                if(obj['msg']=='pcsErr'){

                    if(!respType){
                        res.end(JSON.stringify({'Capability':obj}))
                      }else{
                        r=builder.buildObject(
                            {'error':'data meta invaild'})
                        res.end(r)
                      }

                     r=builder.buildObject(
                        {'error':'data meta invaild'})
                }else{

                    if(!respType){
                        // 格式化xml转换的json，去掉'$'符号
                        let formatJson={}
                        formatJson['description']=obj.data.metaDetail['Method']['Description']!=undefined?obj.data.metaDetail['Method']['Description'][0]:obj.data.metaDetail['Method']['Description']

                        if(obj.data.metaDetail['Method']['Dependency']&&obj.data.metaDetail['Method']['Dependency'].length>0){
                   
                            let Dependency=[]
                            for( let it in obj.data.metaDetail['Method']['Dependency'][0]['Item']){
                         
                                Dependency.push(obj.data.metaDetail['Method']['Dependency'][0][['Item']][it]['$'])
                            }
                            formatJson['dependency']=Dependency
                        }
                      
                        if(obj.data.metaDetail['Method']['Input']&&obj.data.metaDetail['Method']['Input'].length>0){
                            let Input=[]
                            for( let it in obj.data.metaDetail['Method']['Input'][0]['Item']){
                                
                                Input.push(obj.data.metaDetail['Method']['Input'][0]['Item'][it]['$'])
                            }
                            formatJson['input']=Input

                        }

                        if(obj.data.metaDetail['Method']['Output']&&obj.data.metaDetail['Method']['Output'].length>0){
                            let Output=[]
                            for( let it in obj.data.metaDetail['Method']['Output'][0]['Item']){
                                 

                                Output.push(obj.data.metaDetail['Method']['Output'][0]['Item'][it]['$'])
                            }
                            formatJson['output']=Output
                        }   

                        if(obj.data.metaDetail['Method']['Parameter']&&obj.data.metaDetail['Method']['Parameter'].length>0){
                                let Parameter=[]
                                for( let it in obj.data.metaDetail['Method']['Parameter'][0]['Item']){
                                    Parameter.push(obj.data.metaDetail['Method']['Parameter'][0]['Item'][it]['$'])
                                }
                                formatJson['parameter']=Parameter
                        }

                        obj.data.metaDetail=formatJson

                        res.end(JSON.stringify({'code':0,'capability':obj}))

                    }else{
                        r=builder.buildObject(
                            {
                            Capability:obj.data, 
                          })
                    }

                    
                }
                 
              
    
                  res.end(r)
    
              }
            }      
        });


    return

}
