<template lang="html">
<div id="container">
    <p>修改联系方式</p>

    <form @submit='formSubmit'>

        <label id='phone-control' class='contact-control'>
            <p>手机号</p>
            <input name='phoneNumber' :value='userInfo.userContact && userInfo.userContact.phoneNumber' />
        </label>

        <label id='qq-control' class='contact-control'>
            <p>QQ号</p>
            <input name='qqNumber' :value='userInfo.userContact && userInfo.userContact.qqNumber' />
        </label>

        <label id='weixin-control' class='contact-control'>
            <p>微信号</p>
            <input name='weixinNumber' :value='userInfo.userContact && userInfo.userContact.weixinNumber' />
        </label>

        <button formType='submit' size='default'>提交</button>
    </form>
</div>

</template>

<script>
import Config from '@/utils/config'

export default {
    data: {
        service: Config['service'],
        userInfo: {}
    },

    methods: {
        filterContact () {
            if(this.userInfo.userContact.phoneNumber === "null") {
                this.userInfo.userContact.phoneNumber = "";
            }
            if (this.userInfo.userContact.qqNumber === "null") {
                this.userInfo.userContact.qqNumber = "";
            }
            if (this.userInfo.userContact.weixinNumber === "null") {
                this.userInfo.userContact.weixinNumber = "";
            }
        },
        formSubmit (e) {
          console.log(e.mp.detail);
          let phoneNumber = e.mp.detail.value.phoneNumber;
          let qqNumber = e.mp.detail.value.qqNumber;
          let weixinNumber = e.mp.detail.value.weixinNumber;
          this.userInfo.userContact.phoneNumber = phoneNumber;
          this.userInfo.userContact.qqNumber = qqNumber;
          this.userInfo.userContact.weixinNumber =  weixinNumber;

          console.log(this.userInfo);

          // 同步到服务器
          wx.request({
            url: this.service + '/api/v1/user/contact/' + this.userInfo.id,
            method: 'POST',
            data: {
              phoneNumber: this.userInfo.userContact.phoneNumber,
              qqNumber: this.userInfo.userContact.qqNumber,
              weixinNumber: this.userInfo.userContact.weixinNumber
            },
            success: res => {
              console.log(res);
              let data = JSON.parse(res.data);
              if (data.code === 1) {
                console.log('修改成功');
                wx.showToast({
                  title: '修改成功'
                });
              } else if (data.code === 2) {
                wx.showToast({
                  title: '服务器发生错误',
                  icon: 'none'
                });
              } else if (data.code === 0) {
                wx.showToast({
                  title: '用户不存在',
                  icon: 'none'
                });
              }

              wx.reLaunch({
                url: '/pages/profile/main'
              });

              console.log('redirect');

            }
          })
        }
    },

    beforeMount () {
        console.log('in changeContact')
        let user_id = wx.getStorageSync('userData').id || ''
        console.log('user_id', user_id)
        this.userInfo['id'] = user_id;
        let query = this.$root.$mp.query
        console.log('query', query);
        this.userInfo['userContact'] = query;
        this.filterContact();
        console.log('this.userInfo', this.userInfo);
   }



}
</script>

<style lang="css">
</style>
