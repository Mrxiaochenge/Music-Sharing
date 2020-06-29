let movableAreaWidth=0
let movableviewWidth=0
// 获取微信音乐管理器
const backgroundAudioManager=wx.getBackgroundAudioManager()
// 当前的秒数
let currentSec=-1
// 当前歌曲的总时长
let duration=0
// 表示当前进度条是否在拖拽
let isMoving=false
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  isSame:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0,
    progress: 0,
  },

lifetimes:{
 ready(){
   if(this.properties.isSame&&this.data.showTime.totalTime=='00:00'){
     this._setTime()
   }
   this._getMovableDis()
   this._bindBGMEvent()
 }
},
  /**
   * 组件的方法列表
   */
  methods: {
    // 移动进度条的事件
    onChange(event){
    //  console.log(event)
    //  拖动
    if(event.detail.source=='touch'){
    this.data.progress=event.detail.x/(movableAreaWidth-movableviewWidth)*100
    this.data.movableDis=event.detail.x
    isMoving=true
    }
   },

    // 离开进度条的事件
    onTouchEnd(){
   const currentTimeFmt=  this._dataFormat( Math.floor(backgroundAudioManager.currentTime))
    this.setData({
      progress:this.data.progress,
      movableDis:this.data.movableDis,
      ['showTime.currentTime']:`${currentTimeFmt.min}:${currentTimeFmt.sec}`
    })
    backgroundAudioManager.seek(duration*this.data.progress/100)
    isMoving=false
    },

  _getMovableDis(){
    const query=this.createSelectorQuery()
    query.select('.movable-area').boundingClientRect()
    query.select('.movable-view').boundingClientRect()
    query.exec((rect)=>{
      console.log(rect)
      movableAreaWidth=rect[0].width
      movableviewWidth = rect[1].width
    })
  },

  _bindBGMEvent(){
    // 播放事件
    backgroundAudioManager.onPlay(()=>{
     console.log('Play')
     isMoving=false
      this.triggerEvent('musicPlay')
    })
     // 暂停播放事件
    backgroundAudioManager.onStop(()=>{
      console.log('Stop')
     
    })
    // 暂停事件
    backgroundAudioManager.onPause(() => {
      console.log('Pause')
      this.triggerEvent('musicPause')
    })
    // 监听音频正在加载当中
    backgroundAudioManager.onWaiting(() => {
      console.log('Waiting')
    })
    // 能够播放的事件
    backgroundAudioManager.onCanplay(() => {  
      if (typeof backgroundAudioManager.duration!='undefined' ){
          this._setTime()
      }else{
        setTimeout(()=>{
        this._setTime()
        },1000)
      }
    })
    // 音乐播放的进度
    backgroundAudioManager.onTimeUpdate(() => {
      // console.log('onTimeUpdate')
      // 已经播放的时间
      if(!isMoving){
        const currentTime = backgroundAudioManager.currentTime
        // 总时长
        const duration = backgroundAudioManager.duration
        //  如果
        if (currentTime.toString().split('.')[0] != currentSec) {
          const currentTimeFut = this._dataFormat(currentTime)
          this.setData({
            movableDis: (movableAreaWidth - movableviewWidth) * currentTime / duration,
            progress: currentTime / duration * 100,
            ['showTime.currentTime']: `${currentTimeFut.min}:${currentTimeFut.sec}`
          })
          currentSec = currentTime.toString().split('.')[0]
          // 联动歌词
          this.triggerEvent('timeUpdate',{
            currentTime
          })
        }
      } 
    })
    // 播放完之后处理的事件
    backgroundAudioManager.onEnded(() => {
      console.log('onEnded')
      this.triggerEvent('musicEnd')
    })
    // 错误
    backgroundAudioManager.onError((res) => {
       console.error(res.errMsg)
      console.error(res.errCode)
      wx.showToast({
        title: '错误'+res.errCode,
      })
    })
  },
  _setTime(){
    duration=backgroundAudioManager.duration
    // console.log(duration)
  const durationFmt=  this._dataFormat(duration)
  // console.log(durationFmt)
  this.setData({
     ['showTime.totalTime']:`${durationFmt.min}:${durationFmt.sec}`
  })
  },
  // 格式化播放时间
  _dataFormat(sec){
    // 分钟
    const min = Math.floor(sec / 60) 
    sec=Math.floor(sec%60)
    return {
     'min':this._parse0(min),
      'sec':this._parse0(sec)
    }
  },
  // 补0
  _parse0(sec){
    return sec<10?'0'+sec:sec
  }
  }
})
