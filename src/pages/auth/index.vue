<template lang="html">
    <div id="container" :style="{height: height + 'px'}">
        <img class="logo" src="https://ikebo.cn/static/logo.jpg">
        <p class="title">武汉学院身份认证</p>
        <div class="input-control">
            <span class="iconfont">&#xe643;</span>
            <input v-model='stu_id' type="number" placeholder="学号/教工卡号" />
        </div>
        <div class="input-control">
            <span class="iconfont">&#xe69b;</span>
            <input id="pwd-input" v-model='stu_pwd' :password='true' placeholder="教务系统密码" />
        </div>
        <div id="des">
            <p id="des-title">您的信息将被保护</p>
            <p id="des-content">
                您的密码将被密文传输接入学校教务系统完成认证, 我们不会以任何形式存储您的密码
            </p>
        </div>
        <button @click='onSubmit' :disabled='disable' :class="[disable ? 'disable': '']" type="primary" size='default'>提交</button>
    </div>
</template>

<script>
import {post, showSuccess, switchTab, showLoading, hideLoading} from '@/utils/util'

export default {
    data () {
        return {
            stu_id: '',
            stu_pwd: '',
            height: 0,
            user_id: null,
            post: 0,
        }
    },

    computed: {
        disable () {
            return this.stu_id === '' || this.stu_pwd === ''
        }
    },

    methods: {
        async onSubmit () {
            console.log('...........')
            let data = {
                user_id: this.user_id,
                stu_id: this.stu_id,
                stu_pwd: this.stu_pwd
            }
            console.log(data)
            showLoading('请稍后..')
            let res = await post('/api/v1/user/auth', data)
            if (res) {
                showSuccess('认证成功')
                setTimeout(()=> {
                    wx.setStorageSync('auth', true)
                    console.log('post', this.post)
                    if (this.post === 2) {
                        switchTab('/pages/index/main')
                    } else if (this.post === 1) {
                        switchTab('/pages/post/main')
                    } else if (this.post === 0){
                        switchTab('/pages/profile/main')
                    }
                }, 500)
            } else {
                hideLoading()
            }
            console.log(res)
        }
    },


    onLoad() {
        wx.getSystemInfo({
            success: res => {
                this.height =  res.windowHeight
            }
        })
    },

    onUnload() {
        this.stu_id = ''
        this.stu_pwd = ''
    },

    beforeMount () {
        this.user_id = Number(this.$root.$mp.query.id)
        this.post = Number(this.$root.$mp.query.post)
        if (this.post === 2) {
            wx.showModal({
                title: '说明',
                content: '为保障武汉学院师生信息安全,请认证后使用',
                confirmText: '确定',
                confirmColor: '#2489cd',
                showCancel: false,
            })
        }
        console.log('this.user_id', this.user_id, this.post)
    }



}
</script>

<style lang="css">

* {
    margin: 0;
    padding: 0;
}

#container {
    background-color: #f8f8f8;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
}

.logo {
    width: 220rpx;
    height: 220rpx;
    border-radius: 20rpx;
    margin-top: 2em;
}

.title {
    font-size: 1.2em;
    color: #333;
    margin: 1em 0;
}

.input-control {
    width: 80%;
    height: 2.6em;
    border: 2px solid #999;
    box-sizing: border-box;
    margin-bottom: 1.8em;
    font-size: .9em;
    border-radius: 10rpx;
    /* padding-left: 1em; */

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
}

.input-control span {
    font-size: 1.3em;
    padding: 0 .1em;
}


button {
    width: 80%;
    height: 2.3em;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center; 
    background-color: #2489cd !important;
}

button[disabled] {
    width: 80%;
    height: 2.3em;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center; 
    background-color: #ddd !important;
}

/* .disable {
    background-color: #999 !important;
} */

#des {
    margin-top: -1.6em;
    width: 80%;
    display: flex;
    flex-flow: column nowrap;
    font-size: .8em;
    /* margin-left: calc(-1em - 1px); */
    margin-bottom: 2.4em;
}

#des-title {
    font-size: 0.85em;
    font-weight: bold;
}

#des-content {
    font-size: 0.8em;
    font-weight: normal;
    color: #666;
}

.iconfont {
    font-size: 1.2em;
}

</style>
