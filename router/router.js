const base=require('../service/base.js')
const test=require('../service/test.js')

//获取所有在线节点
exports.onlineNodes=base.onlineNode;
//获取对应节点所有处理服务
exports.onlineNodesAllPcs=base.onlineNodesAllPcs;
//执行处理方法
exports.excuteProcess=base.excuteProcess;
// 调用其他节点处理方法,数据在接口调用者处
exports.invokeDistributedPc=base.invokeDistributedPc
// 调用处理方法，数据是url
exports.invokeUrlDataPcs=base.invokeUrlDataPcs
// 元数据获取
exports.metaInfo=base.metaInfo;

// 获取数据
exports.distributedData=base.distributedData;


// test
exports.test=test.test;