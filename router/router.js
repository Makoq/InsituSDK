const base=require('../service/base.js')

//获取所有在线节点
exports.onlineNodes=base.onlineNode;
//获取对应节点所有处理服务
exports.onlineNodesAllPcs=base.onlineNodesAllPcs;
//执行处理方法
exports.excuteProcess=base.excuteProcess;
// 调用其他节点处理方法
exports.invokeDistributedPc=base.invokeDistributedPc
// 获取数据
exports.distributedData=base.distributedData;
