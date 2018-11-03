<template lang="html">
    <div id="container">
        <img :src="src" mode="aspectFit" @click='onClickLogo'>
        <div id="intro">
        	<h3 class="title">介绍</h3>
            <wxparser :rich-text="richText" />
        </div>
        <div id="logo">
        	<h3 class="title">更新日志</h3>
        	<div class="logo-control">
                <p class="logo-detail">
                    <span>v1.5.2</span>解决iphone底部导航文字不显示问题及异步加载数据不同步问题(2018-10-31)
                </p>
                <p class="logo-detail">
                    <span>v1.5.0</span>为保护同学们的个人信息(如姓名班级手机号), 只有身份认证后才可进入(2018-10-29)
                </p>
                <p class="logo-detail">
                    <span>v1.4.7</span>修改了认证页面(2018-10-28)
                </p>
                <p class="logo-detail">
                    <span>v1.4.6</span>解决搜索渲染延迟问题(2018-10-27)
                </p>
                <p class="logo-detail">
                    <span>v1.4.4</span>首次发布需要认证身份(2018-10-26)
                </p>
                <p class="logo-detail">
                    <span>v1.4.3</span>增加转发,分享,选择地址,删除图片,修改了个人页面样式(2018-10-26)
                </p>
                <p class="logo-detail">
                    <span>v1.3.6</span>修改了logo,开通身份认证,修改了发布页面样式(2018-10-24)
                </p>
                <p class="logo-detail">
                    <span>v1.2.3</span>上线初版(2018-09-26)
                </p>
                <p class="logo-detail">
                    <span>v1.1.0</span>改用mpvue重写(2018-08-26)
                </p>
        		<p class="logo-detail">
        			<span>v1.0.0</span>初版完成(2018-08-20)
        		</p>
        	</div>
        </div>
    </div>
</template>

<script>

export default {
    data () {
        return {
            src: 'https://ikebo.cn/static/logo.jpg',
            richText: `"武院寻物招领"是隶属于信息中心网技团的"Young"团队开发的公益项目. 开源地址"https://github.com/ikebo/small-laf". 联系邮箱:'k_1043@126.com',欢迎技术交流. 更多产品敬请关注.
                `
        }
    },

    methods: {
    	onClickLogo () {
    		wx.previewImage({
    			urls: [this.src]
    		})
    	}
    },

    created() {
    	console.log('about created')
    }
}
</script>

<style lang="css">

* {
    margin: 0;
    padding: 0;
}

#container {
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
}

#intro {
    padding: 1em;
}

.title {
    font-size: 1.2em;
    color: #2489cd;
}

.detail {
    font-size: .8em;
    display: flex;
    line-height: 30rpx;
}

#logo {
    align-self: flex-start;
    padding: 1em;
}

.logo {
    font-size: .85em;
}

.logo-detail span {
    color: #2489cd;
    margin-right: .5em;
}

</style>
