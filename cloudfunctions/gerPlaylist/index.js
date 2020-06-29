// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
// 云数据库初始化
const db=cloud.database()
const rp = require('request-promise')
const URL = 'http://musicapi.xiecheng.live/personalized'
const playlistCollection=db.collection('playlist')
const MAX_LTMIT=100
// 云函数入口函数
exports.main = async (event, context) => {

  // const list = await playlistCollection.get()
  //突破获取数据条数的限制
  const countResult=  await playlistCollection.count()
  const total=countResult.total
  const batchTimes=Math.ceil(total/MAX_LTMIT)
  const tasks=[]
  for(let i=0;i<batchTimes;i++){
   let promise=  playlistCollection.skip(i * MAX_LTMIT).limit(MAX_LTMIT).get()
    tasks.push(promise)
  }
  let list={
    data:[]
  }
  if(tasks.length>0){
 list=(await Promise.all(tasks)).reduce((acc,cur)=>{
     return {
       data:acc.data.concat(cur.data)
     }
  })
  }



  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })
  //歌单数据去重
  const newData=[]
   for(let i=0;i<playlist.length;i++){
     let flag=true
      for(let j=0;j<list.data.length;j++){
           if(playlist[i].id===list.data[j].id){
              flag=false
              break
           }
      }
      if(flag){
    newData.push(playlist[i])
      }
   }

  // console.log(playlist)
  for(let i=0,len=newData.length;i<len;i++){
    await playlistCollection.add({
      data:{
       ...newData[i],
        createTime:db.serverDate(),
      }
    }).then((res)=>{
      console.log('插入成功')
    }).catch((err)=>{
      console.error('插入失败')
    })
  }
  return newData.length
}