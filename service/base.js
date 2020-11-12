// const WS=require('../websocket/websocket.js')

exports.onlineNode=function(req,res,next){
      let WS=req.wsClient
      WS.on('open', function open() {
            WS.send('{ "msg":"connlist" }');
      });
       
      WS.on('message', function incoming(data) {
        console.log("list",data);
            res.send(data)
            return
            WS.close()
      });
}



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
      WS.on('open', function open() {
            WS.send(JSON.stringify(message));
      });
       
      WS.on('message', function incoming(data) {
        
            let obj=JSON.parse(data)
            res.send({code:-0,data:obj})
            if(obj.res!=undefined){
                WS.close()
            }
            return
            
      });




}