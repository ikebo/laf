<template lang="html">
<div id="container">
    <div id="itemInfo">
        <p class='title'>物品信息</p>
        <img :src="item.img" />
        <p v-if="item.type===0">类型：失物</p>
        <p v-else>类型：招领</p>
        <p>时间：{{item.date}}</p>
        <p>地点：{{item.place}}</p>
        <p>描述：{{item.des}}</p>
    </div>

    <div id="userInfo">
        <p class='title' v-if="item.type===0">失主信息</p>
        <p class='title' v-else>捡到者信息</p>
        <img :src="user && user.avatarUrl">
        <p>用户名: {{user && user.nickName}}</p>
        <p>手机: {{user && user.phoneNumber}}</p>
        <p>QQ: {{user && user.qqNumber}}</p>
        <p>微信: {{user && user.weixinNumber}}</p>
    </div>

    <div id="contact">
        <div v-if="user && user.phoneNumber">
            <p v-if="item.type===0">你捡到啦?</p>
            <p v-else>是你丢的?</p>
            <button @tap='makePhoneCall' type='primary' size='mini' >联系TA</button>
        </div>

        <div v-else>
            对方暂未填写手机号，无法直接联系对方。
        </div>
    </div>
</div>
</template>

<script>
import Config from '@/utils/config'
export default {
    data: {
        service: Config['service'],
        item: null,
        user: null
    },

    methods: {
        makePhoneCall () {
          wx.makePhoneCall({
            phoneNumber: this.user.phoneNumber
          });
        }
    },

    beforeMount (query) {
        console.log('in item detail')
        let itemData = wx.getStorageSync('itemData')
        if (!itemData) {
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
          return ;
        }
        let itemId = Number(this.$root.$mp.query.itemId);
        console.log('itemId', itemId);

        for(let i=0; i<itemData.length; ++i) {
          console.log(itemData[i].id);
          if(itemData[i].id === itemId) {
            this.item =itemData[i]
          }
        }

        console.log('this.item', this.item)
        // 清除全部数据缓存
        //wx.clearStorage();

        // 获取用户信息
        let user_id = this.item.user_id;
        wx.request({
          url: this.service +  '/api/v1/user/' + user_id,
          method: 'GET',
          success: res => {
            console.log(res);
            this.user = res.data.userData;
            console.log('this.user', this.user)
          }
        });

    }
}
</script>

<style lang="css">
#container {
  display: flex;
  flex-direction: column;
  position: relative;
}

#itemInfo {
  display: flex;
  flex-flow: column nowrap;
}

.title {
  /* color: #1aad19; */
  color: #333;
  font-size: .8em;
  text-align: center;
  margin: .5em 0;
}

img {
  width: 100%;
  height: 300rpx;
}

#userInfo {
  display: flex;
  flex-flow: column nowrap;
}

#contact {
  display: flex;
  flex-flow: row nowrap;
  position: absolute;
  bottom: -100rpx;
  right: 5rpx;
}
</style>
