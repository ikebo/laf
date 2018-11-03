<template lang="html">
<div id='container' :style="{height: height + 'px'}">

    <div id='userInfo'>
        <div v-show='userInfo && canUseInfo' class='userInfo-left'>
            <img :src='userInfo && userInfo.avatarUrl' @click='onImgPreview(userInfo.avatarUrl)'/>
            <p v-show='userInfo && canUseInfo'>{{userInfo && userInfo.nickName}}
                <!-- <span class="iconfont" :style="{fontSize: '1.5em', marginLeft: '4rpx'}">&#xe70f;</span> -->
            </p>
        </div>

        <div v-if='canUseInfo===false' class="userInfo-left">
            <button size='mini' id='authBtn' v-if="canUseInfo === false" open-type="getUserInfo" type='primary' :plain='true' @getuserinfo="onGotUserInfo" class="iconfont">
                <p>&#xe652;</p>
            </button>
        </div>

        <div id='userInfo-right'>
            <p>
                <button v-if='!auth' @click='onAuthClick' type="primary" size='mini' :plain='true'><span>.未认证</span></button>
                <button v-if='auth' :style="{'borderColor': '#1aad19', 'color':'#1aad19'}" type="primary" size='mini' :plain='true'><span>.已认证</span></button>
            </p>
            <!-- <p>
                <span class="iconfont about-icon">&#xe760;</span>
                <span class="about" @click='onAboutClick'>关于</span>
            </p> -->
        </div>
    </div>

    <div id="bottom-container">
        <div class="control" @tap='onAuthClick'>
            <span class="iconfont control-icon" :style="{fontWeight: 'lighter', color: '#333'}">&#xe643;<span class="inline-span">身份认证</span></span>
            <span class="iconfont arrow-icon">&#xe606;</span>
        </div>

        <div class="item-control control" @tap='onClickPosts'>
            <span class="iconfont control-icon">&#xe79c;<span class="inline-span">我的发布</span></span>
            <span class="iconfont arrow-icon">&#xe606;</span>
        </div>

        <div class="setting control" @tap='onClickAdvice'>
            <span class="iconfont control-icon">&#xe6a1;<span class="inline-span bot-span">反馈</span></span>
            <span class="iconfont arrow-icon">&#xe606;</span>
        </div>

        <div class="control" @tap='onAboutClick'>
            <span class="iconfont control-icon" :style="{fontWeight: '200', color: '#666'}">&#xe760;<span class="inline-span bot-span">关于</span></span>
            <span class="iconfont arrow-icon">&#xe606;</span>
        </div>
        


    </div>
</div>
</template>

<script>
import {showModal,showMsg,navigate,hasInfoAuth,post} from '@/utils/util'

export default {
    data () {
        return {
            userInfo: null,
            user: null,
            canUseInfo: true,
            height: 0,
            auth: false
        }
    },

    methods: {
        onImgPreview (src) {
            wx.previewImage({
                urls: [src]
            })
        },
        async update_avatar () {
            // 将用户头像，用户名发送到服务器
            console.log('update avatar ..........')
            let data = {
                avatarUrl: this.userInfo.avatarUrl,
                nickName: this.userInfo.nickName
            }
            await post(`/api/v1/user/avatar/${this.user.id}`, data)
        },

        onClickPosts () {
            navigate(`/pages/itemsControl/main?id=${this.user.id}`)
        },

        onClickAdvice () {
            navigate(`/pages/advice/main?id=${this.user.id}`)
        },

        onTapPostControl: function() {
            let user_id = this.user.id;
        },

        onGotUserInfo: function (e) {
            if(e.mp.detail.userInfo) {
                this.userInfo = e.mp.detail.userInfo
                this.canUseInfo = true
                this.update_avatar()
            }
            console.log('userinfo', e.mp.detail)
        },

        async isAuth () {
            let infoOrFalse = await hasInfoAuth()
            console.log('infoOrfalse', infoOrFalse)
            this.userInfo = infoOrFalse ? infoOrFalse : this.userInfo
            this.canUseInfo = Boolean(infoOrFalse) ? this.update_avatar() : false
            console.log('this.canUseInfo', this.canUseInfo)
            if (!this.canUseInfo) {
                showMsg('请先授权头像昵称')
            }
        },

        onAboutClick () {
            navigate(`/pages/about/main`)
        },

        onAuthClick () {
            let auth = wx.getStorageSync('auth')
            if (auth) {
                showMsg('您已认证')
            } else {
                navigate(`/pages/auth/main?id=${this.user.id}&post=0`)
            }
        }
    },

    created() {
        wx.showShareMenu({
            withShareTicket: false
        })
        let got = wx.getStorageSync('got')
        if (!got) {
            let app = getApp()
            app.userInfoReadyCallbackForProfile = res => {
                this.user = res
                console.log('userInfoReadyCallbackForProfile......')
            }    
        } else {
            this.user = wx.getStorageSync('userData')
        }
        wx.getSystemInfo({
            success: res => {
                console.log(res.windowHeight)
                this.height = res.windowHeight
            }
        })
        // this.isAuth()
    },

    beforeMount (options) {
        // 获得全局数据：用户id
        // this.auth = wx.getStorageSync('auth')
        // const user = wx.getStorageSync('userData')
        // this.user =   user
        // console.log('in profile, user', user)

        this.isAuth()
    },

    onShow() {
        this.auth = wx.getStorageSync('auth') || false
        // this.auth = Number(this.user.qqNumber) ? true : false
        console.log('this.auth', this.auth)
    },

    onShareAppMessage () {
        return {
            title: '武汉学院线上失物招领平台, 来看看吧！',
            path: 'pages/index/main',
            imageUrl: 'https://ikebo.cn/static/logo.jpg'
        }
    }

}
</script>

<style lang="css">

#container {
    background-color: #f5f5f5;
}

#bottom-container {
    padding: .5em 0;
}

.control {
    background-color: #fff;
    font-size: 1.06em;
    color: #2c2c2c;
    padding: .5em 0;
    padding-left: .5em;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    margin-bottom: .3em;
}

.inline-span {
    font-weight: normal; 
    font-size: .96em;
    margin-left: .3em;
    color: #333;
}

.bot-span {
    color: #666;
}

.control-icon {
    font-size: 1.08em;
    color: #000;
    margin-right: .5em;
    font-weight: 550;
}

.arrow-icon {
    font-size: 1.08em;
    color: #999;
    margin-right: .3em;
}

.about-icon {
    font-size: .8em;
    margin-right: 8rpx;
}

.about {
    font-size: .9em;
}

#userInfo {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  padding-left: 20rpx;
  background-color: #2489cd;
  /* background-color: #fff; */
  padding-bottom: 20rpx;
  color: #fff;
  font-size: 0.9em;
  position: relative;
}

.userInfo-left {
    margin-top: 1em;
    font-size: 1.1em;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;

}

.userInfo-left button {
    width: 140rpx !important;
    height: 140rpx !important;
    border-radius: 50%;
    border: 6rpx solid !important;
    margin-bottom: .6em;
}

.userInfo-left button p {
    font-size: 1.5em !important;
}

.userInfo-left img {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    border: 6rpx solid #b2d7fc;
    margin-bottom: .6em;
}

#userInfo-right {
    display: flex;
    align-self: flex-end;
    flex-flow: row nowrap;
    justify-content: flex-end;
    padding-right: 20rpx;
    align-items: center;
}

#authBtn {
    font-size: 55rpx;
    width: 110rpx;
    height: 110rpx;
    padding: 0 !important;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    color: #999;
    border-color: #999;
}

#userInfo-right button {
    width: 4em;
    height: 2em;
    font-size: .8em;
    padding: 0 !important;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 2rpx;
    color: #fff;
    border-color: #fff;
    margin-right: 1em;
}

#auth {
    width: 4em;
    height: 2em;
    font-size: .8em;
    padding: 0 !important;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 2rpx;
    color: #fff;
    border-color: #fff;
    margin-right: 1em;
}


</style>
