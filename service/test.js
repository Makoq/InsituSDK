
const { IncomingForm } = require('formidable');
const Request=require('request')
const uuid=require('uuid')
const fs=require('fs')
const getSize = require('get-folder-size');

exports.test=function(req,res,next){

   let  myFolder =__dirname+'/../uploadFiles'
   getSize(myFolder, (err, size) => {
    if (err) { throw err; }
    console.log(size + ' bytes');
    console.log((size / 1024 / 1024).toFixed(2) + ' MB');
  });


  




}


exports.upload=function user(req,res,config){ 
     
    let fs=require('fs');
    let async = require('async');//异步模块
    
        // 切片的临时存储
         let dirPath=__dirname+"/../uploadFiles/tep/";
    
         let index=req.body['index'];//当前片数
         let total=req.body['total'];//总片数
         let name=req.body['name'];//文件名称
       
         let url= dirPath+'/'+name.split('.')[0]+'_'+index+'.'+name.split('.')[1];//临时bolb文件新名字
      
         try{
            if(index==total){//当最后一个分片上传成功，进行合并
                /*
                    检查文件是存在，如果存在，重新设置名称
                */
          
                    let bf=Buffer.from(req.body['data'])
                    fs.writeFileSync(url,bf)
                
                    let uid=uuid.v4()
                    fs.mkdirSync(__dirname+"/../uploadFiles/"+uid)
                    let pathname=__dirname+"/../uploadFiles/"+uid+'/'+name;//上传文件存放位置和名称
                    //这里定时，是做异步串行，等上执行完后，再执行下面
                    setTimeout(function(){
                    let writeStream=fs.createWriteStream(pathname);
                    let aname=[];
                    for(let i=1;i<=total;i++){
                        let url=dirPath+'/'+name.split('.')[0]+'_'+i+'.'+name.split('.')[1];
                        aname.push(url);
                    }
                    let bf=[]
                    //async.eachLimit进行同步处理
                    async.eachLimit(aname,1,function(item,callback){
                        //item 当前路径， callback为回调函数
                        fs.readFile(item,function(err,data){    
                           if(err)throw err;
                           //把数据写入流里，这里有两种方式
                           // 第一种是利用stream边读边写，这种方式相对于第二种对于内存更加友好
                            writeStream.write(data);
                            // 第二种是利用拼接buffer进行，但由于是将所有文件读取buffer并放在bf数组中进行拼接，可能由于bf数组过大导致内存溢出，所以舍弃
                            // bf.push(data)

                            //删除生成临时bolb文件              
                            fs.unlink(item,function(){console.log('删除成功');})
                            callback();
                        });
                    },function(err){
                        if (err) throw err;
                        //后面文件写完，关闭可写流文件，文件已经成生完成
                        // 这里同时有两种方式进行文件合并
                        //第一种，是关闭流，由于利用stream是边读边写的，对内存友好
                        writeStream.end();

                        // 第二种，利用Buffer的concat函数进行buffer拼接，这种方式可能会造成内存溢出，故舍弃
                        //  let re=Buffer.concat(bf)
                        //  fs.writeFileSync(pathname,re)

                       
                        //返回给客服端，上传成功
                        let data=JSON.stringify({'code':0,"data": {
                            "source_store_id": uid,
                            "file_name": name
                        }});
                        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'}); 
                        res.end(data);//返回数据    
                    });
                },50)
                
            }else{//还没有上传文件，请继续上传
                // bf.fill(req.body['data'])
                let bf=Buffer.from(req.body['data'])
                fs.writeFileSync(url,bf)


                let data=JSON.stringify({'code':1,'msg':'继续上传'});
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'}); 
                res.end(data);//返回数据    
            }
         }catch(err){
             console.log(err)
         }
       
   
   
}; 
 
 


