
const { IncomingForm } = require('formidable');
const Request=require('request')
const uuid=require('uuid')

exports.test=function(req,res,next){
    let url =req.body.url;
 
    Request(url, function (err, response, body) {
        console.log(response.headers['content-disposition'])
             res.send({code:-1,data:response.headers['content-disposition']})   
      });

}


exports.upload=function user(req,res,config){ 
     
    let fs=require('fs');
    let async = require('async');//异步模块
    let formidable=require('formidable')
    let form=new formidable.IncomingForm();
    

    //设置编辑
    form.encoding = 'utf-8';

    let dirPath=__dirname+"/../uploadFiles/tep/";
     
    //设置文件存储路径
    form.uploadDir = dirPath;
    //设置单文件大小限制
   // form.maxFilesSize = 200 * 1024 * 1024;
    /*form.parse表单解析函数，fields是生成数组用获传过参数，files是bolb文件名称和路径*/
    form.parse(req, function (err,fields,files) {
         files=files['data'];//获取bolb文件
         let index=fields['index'];//当前片数
         let total=fields['total'];//总片数
         let name=fields['name'];//文件名称
         let url= dirPath+'/'+name.split('.')[0]+'_'+index+'.'+name.split('.')[1];//临时bolb文件新名字
         fs.renameSync(files.path,url);//修改临时文件名字
    
         try{
            if(index==total){//当最后一个分片上传成功，进行合并
                /*
                    检查文件是存在，如果存在，重新设置名称
                */
                let uid=uuid.v4()
         
                fs.mkdirSync(__dirname+"/../uploadFiles/"+uid)
                let pathname=__dirname+"/../uploadFiles/"+uid+'/'+name;//上传文件存放位置和名称
                fs.access(pathname,fs.F_OK,(err) => {
                    if(!err){   
                        let myDate=Date.now();
                        pathname=dirPath+'/'+myDate+name;
                        console.log(pathname);

                    }
                });
                //这里定时，是做异步串行，等上执行完后，再执行下面
                setTimeout(function(){
                    /*进行合并文件，先创建可写流，再把所有BOLB文件读出来，
                        流入可写流，生成文件
                        fs.createWriteStream创建可写流   
                        aname是存放所有生成bolb文件路径数组:
                        ['Uploads/img/3G.rar1','Uploads/img/3G.rar2',...]
                    */
                    let writeStream=fs.createWriteStream(pathname);
                    let aname=[];
                    for(let i=1;i<=total;i++){
                        let url=dirPath+'/'+name.split('.')[0]+'_'+i+'.'+name.split('.')[1];
                        aname.push(url);
                    }

                    //async.eachLimit进行同步处理
                    async.eachLimit(aname,1,function(item,callback){
                        //item 当前路径， callback为回调函数
                        fs.readFile(item,function(err,data){    
                           if(err)throw err;
                           //把数据写入流里
                            writeStream.write(data);
                            //删除生成临时bolb文件              
                            fs.unlink(item,function(){console.log('删除成功');})
                            callback();
                        });
                    },function(err){
                        if (err) throw err;
                        //后面文件写完，关闭可写流文件，文件已经成生完成
                        writeStream.end();



                        //返回给客服端，上传成功
                        let data=JSON.stringify({'code':0,"data": {
                            "source_store_id": uid,
                            "file_name": name
                        }});
                        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'}); 
                        res.end(data);//返回数据    
                    });
                },50);

            }else{//还没有上传文件，请继续上传
                let data=JSON.stringify({'code':1,'msg':'继续上传'});
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'}); 
                res.end(data);//返回数据    
            }
         }catch(err){
             console.log(err)
         }
       
    });
   
}; 
 
 


