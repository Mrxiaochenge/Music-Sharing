// components/musiclist/musiclist.js
const app=getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
   musiclist:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
  playingId:-1
  },
  pageLifetimes:{
   show(){
     this.setData({
       playingId:parseInt (app.getPlayMusicId())
     })
   }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 选中高亮
  onSelect(event){
  console.log(event.currentTarget.dataset.musicid)
    const db = event.currentTarget.dataset
    const musicid =db.musicid
   this.setData({
     playingId:musicid
   })
   wx.navigateTo({
     url: `../../pages/player/player?musicId=${musicid}&index=${db.index}`,
   })
  }
  }
})
