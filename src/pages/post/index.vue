<template lang="html">
<div id="container" :style="{height: height + 'px', backgroundColor: got_type ? '#f8f8f8' : '#fff'}">
    <div class="get-type" v-if="got_type === false">
        <div class="lost">
            <button @tap='onLostClick' type="warn" size='mini' :plain='true'>寻物启事</button>
        </div>
        <div class="found">
            <button @tap='onFoundClick' type="primary" size='mini' :plain='true'>失物招领</button>
        </div>
    </div>

    <div class="form" v-else>
        <div id="form-top">
            <div id="des">
                <textarea placeholder='请输入要发布的内容'  v-model='des'></textarea>
            </div>

            <div class="union">
                <div class="imgs" v-if='imgs.length'>
                    <div class="img-control"  v-for='(src,index) of srcs' :key='index'>
                        <span class="iconfont" @click="onDelImg(index)">&#xe635;</span>
                        <img :src="service+src"  @click='onImgPreview(srcs,index)'/>
                    </div>
                </div>

                <div class="add" @tap='chooseImg'>
                    <span class="iconfont add-icon">&#xe692;</span>
                </div>
            </div>

            <div class="loca" :style="{backgroundColor: touch_start ? '#f8f8f8' : '#fff'}" @touchstart="onLocaTouchStart" @touchend="onLocaTouchEnd">
                <span class="iconfont loca-icon" :style="{marginRight: '8rpx'}">&#xe623;</span>
               <!--  <input v-model='place' placeholder="地址" style='display: inline-block;' > -->
                <p>{{ place ? place : '地址' }}</p>
                <span class="iconfont loca-arrow">&#xe65b;</span>
            </div>

            <div class="tel">
                <span class="iconfont tel-icon" :style="{marginRight: '8rpx'}">&#xe771;</span>
                <input v-model='tel' type='number' placeholder="请输入您的电话号码" style='display: inline-block;' >
            </div>
        </div>

        <div class="btn-submit">
            <button class="btn-submit" type='primary' @tap='formSubmit'>立即发布</button>
        </div>
    </div>
</div>

</template>

<script>
import Config from '@/utils/config'
import {getSrcs,uploadImg,post,switchTab,showModal,showMsg} from '@/utils/util'
import {checkTel,navigate,showLoading,hideLoading,showSuccess} from '@/utils/util'

export default {
    data: {
        user: null,
        got_type: false,
        type: null,
        des: '',
        tel: '',
        place: '',
        isChoosing: false,
        imgs: [],
        srcs: [],
        service: Config['static_service'],
        height: 0,
        touch_start: false
    },
    // 处理选择图片触发onHide问题
    onHide () {
        if(!this.isChoosing) {
            this.got_type = false
            this.imgs = []
            this.srcs = []
            this.des = ''
            this.place = ''
        } else {
            this.isChoosing = false
        }
    },

    created () {
        wx.showShareMenu({
            withShareTicket: false
        })

        if(!(this.user = wx.getStorageSync('userData') || null)) {
            this.login()
        }
        wx.getSystemInfo({
            success: res => {
                console.log(res.windowHeight)
                this.height = res.windowHeight
            }
        })
    },

    beforeMount (options) {
        this.got_type = false
        this.tel = this.user.phoneNumber || ''
    },

    methods: {
        onLocaTouchStart () {
            console.log('touch start')
            this.touch_start = true
        },
        onLocaTouchEnd () {
            this.touch_start = false
            this.onChooseLocation()
        },
        onChooseLocation () {
            this.isChoosing = true
            wx.chooseLocation({
                success: (res) => {
                    console.log('name', res.name)
                    this.place = res.name
                }
            })    
        },
        onDelImg (index) {
            console.log('del')
            let urls = []
            this.srcs.forEach((img, i) => {
                if (i != index) {
                    urls.push(img)                    
                }
            })
            this.srcs = urls
            // this.srcs.splice(index, 1)
        },

        onImgPreview (src, index=0) {
            this.isChoosing = true
            console.log(src);
            let urls = []
            src.forEach((img) => {
                urls.push(this.service + img)
            })
            wx.previewImage({
                urls,
                current: urls[index]
            })
        },

        async login() {
            const code = await wxLogin()
            const user = await get(`/api/v1/user/${code}`)
            this.user = user
            console.log('user',user)
            wx.setStorageSync('userData', this.user)
            console.log('用户数据缓存成功')
        },

        async uploadImgs() {
            console.log('in uploadImgs')
            this.imgs.forEach(async (img) => {
                let src = await uploadImg(img)
                let urls = []
                this.srcs.forEach((img) => {
                    urls.push(img)
                })
                urls.push(src)
                this.srcs = urls
                // this.srcs.push(src)
                // this.srcs = ['/static/logo.jpg']
            })
        },

        onLostClick () {
            console.log('lost click')
            let auth = wx.getStorageSync('auth')
            console.log('lost auth', auth)
            if (!auth) {
                console.log('')
                wx.showModal({
                    title: '提示',
                    content: '首次发布需要验证身份,请前往个人页面完成身份认证',
                    confirmText: '立即认证',
                    confirmColor: '#2489cd',
                    success: res => {
                        if (res.confirm) {
                            navigate(`/pages/auth/main?id=${this.user.id}&post=1`)
                        }
                    }
                })
            } else {
                this.got_type = true
                this.type = 0
            }
        },

        onFoundClick () {
            console.log('found click')
            let auth = wx.getStorageSync('auth')
            console.log('found auth', auth)
            if (!auth) {
                console.log('not auth')
                wx.showModal({
                    title: '提示',
                    content: '首次发布需要验证身份,请前往个人页面完成身份认证',
                    confirmText: '立即认证',
                    confirmColor: '#2489cd',
                    success: res => {
                        if (res.confirm) {
                            navigate(`/pages/auth/main?id=${this.user.id}&post=1`)
                        }
                    }
                })
            } else {
                this.got_type = true
                this.type = 1
            }
        },

        chooseImg () {
            this.isChoosing = true
            console.log('this.srcs', this.srcs)
            if (this.srcs.length >=3 ) {
                showMsg('最多三张图片')
                return false
            }
            wx.chooseImage({
                count: 3,
                sizeType: ['compressed'],
                success: res => {
                    this.imgs = []
                    res.tempFilePaths.forEach((item)=> {
                        this.imgs.push(item)
                    })
                    this.uploadImgs()
                }
            });
        },

        async formSubmit (e) {
            if (!this.des) {
                showMsg('内容不能为空')
                return false
            }
            if (!checkTel(this.tel)) {
                showMsg('请填写正确的手机号码')
                return false
            }
            showLoading('请稍后..')
            let data = {
                type: this.type,
                des: this.des,
                place: this.place,
                tel: this.tel,
                srcs: this.srcs.join('|')
            }
            console.log('postData', data)
            let res = await post(`/api/v1/item/${this.user.id}`, data)
            hideLoading()
            console.log(res)
            if (res) {
                showSuccess('发布成功')
            } else {
                showMsg('发布失败')
            }
            setTimeout(() =>{
                switchTab('/pages/index/main')
            },500)
        }
    },

    onShareAppMessage (des) {
        console.log('..', des)
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
    /* padding:.2rem; */
    /* background-color: #eee; */
}

#form-top {
    background-color: #fff;
    padding: .35rem .3rem;
}

#des {
    font-size: .9em;
}

textarea {
    height: 250rpx;
}

.union {
    display: flex;
    flex-flow: row nowrap;
}

.imgs {
    display: flex;
    flex-flow: row nowrap;
}

.img-control {
    position: relative;
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 4rpx;
    border-radius: 10rpx;
}

.img-control span {
    position: absolute;
    color: #fff;
    top: 0;
    right: 0;
    display: inline-block;
    width: .4rem;
    height: .4rem;
    border-top-right-radius: 10rpx;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
}


.imgs img {
    width: 100%;
    height: 100%;
    border-radius: 10rpx;
}

.btn-submit {
    margin-top: 2em;
    padding: 0 .3rem;
    color: #fff;
}

.btn-submit button {
    background-color: #2489cd;
    border-radius: .1rem;
    font-size: 1.1em;
    height: 2.6em;

    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
}

.loca {
    position: relative;
    font-size: .9em;
    color: #888;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-top: .2rem;
    padding: .15rem 0;
    margin-bottom: .2rem;
}

.loca-arrow {
    position: absolute;
    right: 0;
}

.tel {
    font-size: .9em;
    color: #888;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-top: .5rem;
    margin-bottom: .2rem;
}

.loca-icon {
    font-size: .95em;
}

.tel-icon {
    /* align-self: flex-end; */
    font-size: .95em;
}

.add {
    width: 1.5rem;
    height: 1.5rem;
    border: 2rpx dashed #ddd;
    border-radius: 10rpx;
    display: flex;
    justify-content: center;
    align-items: center;
}

.add-icon {
    color: #999;
    /* font-weight: lighter; */
    font-size: 0.86rem !important;
}


.get-type {
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-around;
    align-items: center;
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
}

.lost {
    margin-bottom: .5rem;
}

</style>
