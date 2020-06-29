// pages/player/player.js
let musiclist= []
// 正在播放歌曲的index
let nowPlayIndex=0
// 获取全局位移的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
   picUrl:'',
   //  表示是否在播放
   isPlaying:false,
  //  表示当前歌词是否显示
  isLyricShow:false,
  lyric:'',
  // 表示是否同一首歌
  isSame:false,

  }, 

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    nowPlayIndex=options.index
   musiclist= wx.getStorageSync('musiclist')
   this._loadMusicDateil(options.musicId)
  },

  _loadMusicDateil(musicId){
    if(musicId== app.getPlayMusicId()){
      this.setData({
        isSame:true
      })
    }else{
      this.setData({
        isSame: false
      })
    }
    if(!this.data.isSame){
      backgroundAudioManager.stop()
    }
    let music=musiclist[nowPlayIndex]
    console.log(music)
    wx.setNavigationBarTitle({
    title:music.name
  })
  this.setData({
    picUrl:music.al.picUrl,
    isPlaying:false,
  })

  app.setPlayMusicId(musicId)


  wx.showLoading({
    title: '歌曲加载中',
  })
  //  调用云函数
  wx.cloud.callFunction({
  name:'music',
  data:{
    musicId,
    $url:'musicUrl',
    }
    }).then((res)=>{
      console.log(res)
      console.log(JSON.parse(res.result))
      let result = JSON.parse(res.result)
      if(result.data[0].url==null){
       wx.showToast({
         title: '无权限播放',
       })
       return
      }
      if(!this.data.isSame){
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name
        // 保存播放历史
        this.savePlayHistory()
      }
      this.setData({
        isPlaying:true
      })
      wx.hideLoading()
      // 加载歌词
      wx.cloud.callFunction({
        name:'music',
        data:{
          musicId,
          $url:'lyric',
        }
      }).then((res)=>{
        console.log(res)
        let lyric='暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if(lrc){
        lyric=lrc.lyric
           }
           this.setData({
             lyric
           })
      })
    })
  },
  // 点击暂停播放执行的函数
   togglePlaying(){
    //  正在播放
  if(this.data.isPlaying){
    // 暂停
   backgroundAudioManager.pause()
  }else{
    // 播放
    backgroundAudioManager.play()
  }
  this.setData({
    isPlaying:!this.data.isPlaying
  })
   },
   onPrev(){
     nowPlayIndex--
     if(nowPlayIndex<0){
   nowPlayIndex=musiclist.length-1
     }
     this._loadMusicDateil(musiclist[nowPlayIndex].id)
   },
   onNext(){
     nowPlayIndex++
     if (nowPlayIndex ===musiclist.length) {
       nowPlayIndex =0
     }
     this._loadMusicDateil(musiclist[nowPlayIndex].id)
   },

   onChangeLyricShow(){
   this.setData({
     isLyricShow:!this.data.isLyricShow
   })
   },
  timeUpdate(event){
   this.selectComponent('.lyric').update(event.detail.currentTime)
  },

  onPlay(){
  this.setData({
     isPlaying:true
   })
  },
  onPause(){
   this.setData({
      isPlaying: false
    })
  },


  //保存历史播放功能
   savePlayHistory(){
    //  当前正在播放的歌曲对象
   const music=musiclist[nowPlayIndex]
   const openid=app.globalData.openid
   const history=wx.getStorageSync(openid)
   let bHave=false
    for(let i=0;i<history.length;i++){
      if(history[i].id==music.id){
         bHave=true
         break
      }
    }
    if(!bHave){
      history.unshift(music)
      wx.setStorage({
        key: openid,
        data: history,
      })
    }
   },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})