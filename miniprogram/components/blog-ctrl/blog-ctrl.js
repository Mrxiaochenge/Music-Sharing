// components/blog-ctrl/blog-ctrl.js
let userInfo={}
const db=wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
   blogId:String,
   blog:Object,
  },
  externalClasses: ['iconfont', 'icon-fenxiang_2','icon-pinglun'],
  /**
   * 组件的初始数据
   */
  data: {
    // 登录组件是否显示
   loginShow:false,
  //  当前的低部弹出层是否显示
   modalShow:false,
    content:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
   onComment(){
  //  判断用户是否授权
  wx.getSetting({
    success:(res)=>{
      if(res.authSetting['scope.userInfo']){
        wx.getUserInfo({
          success:(res)=>{
             userInfo=res.userInfo
            //  显示评论的弹出层
            this.setData({
              modalShow:true
            })
          }
        })  
      }else {
        // 显示授权的组件
        this.setData({
          loginShow:true
        })
      }
    }
   })
   },
    onLoginsuccess(event){
      userInfo=event.detail
    //  授权框消失，评论框显示
    this.setData({
      loginShow:false
    },()=>{
      this.setData({
        modalShow:true
      })
    })
    },
    onLoginfail(){
      wx.showModal({
        title: '授权用户才能评论',
        content: '',
      })
    },
    onSend(event){
      let formId=event.detail.formId
      //插入数据库
      let content=event.detail.value.content
      if(content.trim()==''){
        wx.showModal({
          title: '评论内容不能为空',
          content: '',
        })
        return
      }
      wx.showLoading({
        title: '评价中',
        mask:true,
      })
       db.collection('blog-comment').add({
         data:{
           content,
           createTime: db.serverDate(),
           blogId: this.properties.blogId,
           nickName: userInfo.nickName,
           avatarUrl: userInfo.avatarUrl
         }
       }).then((res)=>{
         wx.hideLoading()
         wx.showToast({
           title: '评论成功',
         })
         this.setData({
           modalShow:false,
           content:''
         })
        //  父元素刷新评论页面
        this.triggerEvent('refreshCommentList')
       })
    }
  }
})
