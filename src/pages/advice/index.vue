<template lang="html">
    <div id="container" :style="{height: height + 'px'}">
        <textarea v-model='advice' placeholder="请输入您的意见"></textarea>
        <button @click='onSubmit' type='default'><span>提交</span></button>
    </div>
</template>

<script>
import {post,showSuccess,redirect,showLoading,hideLoading} from '@/utils/util'

export default {
    data () {
        return {
            user_id: null,
            height: 0,
            advice: ''
        }
    },

    methods: {
        async onSubmit () {
            console.log("advice", this.advice)
            if (!this.advice) {
                return false
            }
            showLoading('请稍后...')
            let res = await post('/api/v1/user/advice', {user_id: this.user_id, advice:this.advice})
            hideLoading()
            if (res) {
                await showSuccess('反馈成功！')
                setTimeout(() => {
                    wx.navigateBack()
                }, 500)
            }
        }
    },

    onLoad() {
        console.log('onLoad')
        wx.getSystemInfo({
            success: res => {
                this.height =  res.windowHeight
            }
        })
    },

    beforeMount () {
        this.user_id = Number(this.$root.$mp.query.id)
        console.log('user_id', this.user_id)
    },

    onUnload() {
        this.advice = ''
    }
}
</script>

<style lang="css">
#container {
    background-color: #f5f5f5;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
}

textarea {
    background-color: #fff;
    width: 90%;
    border-radius: 5rpx;
    height: 280rpx;
    margin: 30rpx 0;
    font-size: .9em;
    color: #333;
}

button {
    color: #fff !important;
    background-color: #2489cd !important;
    border-style: none;
    width: 60%;
    font-size: 1em;
    height: 2.4em;

    display: flex;
    align-items: center;
    justify-content: center;
}

</style>
