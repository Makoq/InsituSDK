
const Request=require('request')

exports.test=function(req,res,next){
    let url =req.body.url;
 
    Request(url, function (err, response, body) {
        console.log(response.headers['content-disposition'])
             res.send({code:-1,data:response.headers['content-disposition']})   
      });

}