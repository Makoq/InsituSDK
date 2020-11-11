// const WS=require('../websocket/websocket.js')

exports.onlineNode=function(req,res,next){
      let WS=req.wsClient
      WS.on('open', function open() {
            WS.send('{ "msg":"connlist" }');
      });
       
      WS.on('message', function incoming(data) {
        console.log("list",data);
            res.send(data)
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
        console.log("availableocs");
            res.send(data)
            // WS.close()
      });




}