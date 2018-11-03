<script>
import {get, redirect, wxLogin, getSync, wxLoginSync, navigate, switchTab} from '@/utils/util'

export default {
  methods: {
      async login() {
          const code = await wxLogin()
          const user = await get(`/api/v1/user/${code}`)
          let auth = Number(user.qqNumber) ? true : false
          console.log('super auth ........')
          if (!auth) {
            console.log('app.vue fff')
            redirect(`/pages/auth/main?id=${user.id}&post=2`)
          }
          console.log('user',user)
          wx.setStorageSync('userData', user)
          wx.setStorageSync('auth', auth)
          wx.setStorageSync('got', true)
          let app = getApp()
          if (app.userInfoReadyCallbackForIndex) {
            app.userInfoReadyCallbackForIndex(user)
          }
          if (app.userInfoReadyCallback) {
            app.userInfoReadyCallback(user)
          }
          if (app.userInfoReadyCallbackForProfile) {
            app.userInfoReadyCallbackForProfile(user)
          }
          console.log('用户数据缓存成功')
      },
  },

  created () {
      console.log('app.vue created')
      wx.clearStorageSync()
      wx.setStorageSync('got', false)
      this.login()
      console.log('app.vue out')
  }

}
</script>
