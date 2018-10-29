<template>
<div id="container" :style="{paddingTop: padding_top + 'px' }">
    <div class="search-first-container">
        <div v-if='!searching' class="search-first" @click='onSearchClick'>
            <span class="iconfont">&#xe609; 搜索</span>
        </div>
    </div>
    <div v-if='searching' class="search-container">
        <div class="search">
            <span class="iconfont icon-span">&#xe609;</span>
            <input v-model='search_key' confirm-type='search' @confirm='onSearchConfirm(false)'  @blur='onSearchBlur' :focus='true'  placeholder="请输入关键字" />
            <span class="iconfont icon-cancel" @click='onSearchCancelClick'>&#xe635;</span>
        </div>
        <span class="searchBtn" @click='onSearchConfirm(false)'>搜索</span>
    </div>
    <div class="empty iconfont" v-if="empty">
        <span>&#xe631;</span>
        <p>暂无数据</p>
    </div>
    <Item :item='item' @shareItem="onShareItem" :isControl='false' v-for='item of items' :key='item.id'></Item>
    <p class="footer iconfont" :style="{ marginTop: footer_margin_top + 'rpx' }" v-if='!more'>没有更多数据</p>
    <span v-show='go_show' class="go-top iconfont" @click='onGoTop'>&#xe661;</span>
</div>
</template>

<script>
import Config from '@/utils/config'
import {get,post,showLoading,hideLoading,showModal,showMsg} from '@/utils/util'
import Item from '@/components/Item'

export default {
    data () {
      return {
          items: [],
          page: 0,
          more: true,
          searching: false,      // 点击search-first
          search_key: '',        // 搜索关键字
          padding_top: 0,
          padding_temp: 0,       // 存放padding值
          search_result: false,  // 搜索结果状态
          search_page: 0,         // 搜索结果分页
          go_show: false
      }
    },

    computed: {
        footer_margin_top () {
            return this.items.length === 0 ? 0 : -10
        },
        empty() {
            return this.items.length === 0 ? true : false
        }
    },

    components: {
      Item
    },

    methods: {
        onShareItem (des) {
            console.log(des)
            // this.onShareAppMessage(des, '')
        },

        async getItems (init) {
            if (init) {
                this.page = 0
                this.more = true
                this.search_result = false
            }
            wx.showNavigationBarLoading()
            const items = await get('/api/v1/item', {page:this.page})
            console.log('index items', items)
            if (items.length < 8 && this.page > 0) {
                console.log('more false')
                this.more = false
            }
            if (init) {
                this.items = items
                console.log('this.items', this.items)
                wx.stopPullDownRefresh()
            } else {
                this.items = this.items.concat(items)
                console.log('concat', this.items)
            }
            wx.hideNavigationBarLoading()
        },

        onSearchClick () {
            wx.pageScrollTo({
                scrollTop: 0
            })
            this.padding_temp = this.padding_top
            this.padding_top = 0
            this.searching = true
            this.search_key = ''
        },

        onSearchCancelClick () {
            this.padding_top = this.padding_temp
            this.searching = false
        },

        onSearchBlur () {
            this.padding_top = this.padding_temp
            this.searching = false
        },

        async onSearchConfirm (isReachBottom) {
            if(this.search_key === '') {
                return false
            }
            console.log('confirm', this.search_key)
            isReachBottom ? '' : this.search_page = 0
            isReachBottom ? '' : this.more = true
            const data = {
                search_key: encodeURI(this.search_key),
                search_page: this.search_page
            }
            isReachBottom ? '' : showLoading('请稍后..')
            const items = await post(`/api/v1/item/search`, data)
            items.length < 8 ? this.more = false : ''
            isReachBottom ? '' : this.items = []
            this.$nextTick(() => {
                console.log('dom ok')
                let arr = []
                for(let i=0; i<items.length; ++i) {
                    arr.push(items[i])
                    // this.items.push(items[i])
                }
                this.items = arr
                hideLoading()
            })
            this.search_result = true
        },

        onGoTop () {
            if (wx.pageScrollTo) {
                wx.pageScrollTo({
                    scrollTop: 0
                })
            } else {
                showMsg('微信版本太低')
            }
        }
    },

    created() {
        wx.showShareMenu({
            withShareTicket: false
        })
    },

    beforeMount () {
        wx.onNetworkStatusChange((r) => {
            if (!r.isConnected) {
                showMsg('网络未连接')
            }
        })
        console.log('beforeMount')
        this.getItems(true)
        //创建节点选择器
        let query = wx.createSelectorQuery();
        //选择id
        query.select('.search-first-container').boundingClientRect()
        query.exec( (res) => {
          //res就是 所有标签为mjltest的元素的信息的数组
          console.log(res);
          //取高度
          console.log(res[0].height);
          this.padding_top = res[0].height
        })
    },

    onHide () {
        this.searching = false
    },

    onPullDownRefresh () {
        this.getItems(true)
    },

    onReachBottom() {
        console.log('onReachBottom')
        if (!this.more) {
            return false
        }
        if (this.search_result) {
            this.search_page += 1
            this.onSearchConfirm(true)
        } else {
            this.page +=  1
            this.getItems(false)
        }
    },

    onPageScroll (e) {
        if (e.scrollTop > 100) {
            this.go_show = true
        } else {
            this.go_show = false
        }
    },

    onShareAppMessage (options) {
        console.log('out')
        if (options.from == 'button') {
            console.log(options.target.dataset)
            return {
                title: options.target.dataset.des,
                path: 'pages/index/main',
            }
        } else {
            return {
                title: '武汉学院线上失物招领平台, 来看看吧！',
                path: 'pages/index/main',
                imageUrl: 'https://ikebo.cn/static/logo.jpg'
            }    
        }
        
    }
}
</script>

<style scoped>

* {
    margin: 0;
    padding: 0;
}

#container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  background-color: #f5f5f5;
}

.iconfont {
    font-size: .8em !important;
}

.search-first-container {
    background-color: #f5f5f5;
    position: fixed;
    z-index: 10;
    top: 0;
    width: 100%;
}

.search-container {
    /* position: fixed; */
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    padding-right: 20rpx;
    padding-left: 20rpx;
}

.search-first {
    /* position: fixed; */
    background-color: #fff;
    margin: 15rpx 20rpx;
    height: 1.6em;
    border-radius: 4rpx;
    color: #999;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
}

.search {
    flex: 1;
    background-color: #fff;
    margin: 15rpx 20rpx;
    height: 1.6em;
    border-radius: 4rpx;
    color: #999;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
}

#container input {
    flex: 1;
    font-size: .8em;
    color: #333;
}

.icon-span {
    padding-left: 20rpx;
    margin-right: 10rpx;
    color: #333;
}

.icon-cancel {
    font-size: 1em !important;
    padding-right: 20rpx;
    color: #333;
}

.searchBtn {
    background-color: #eee;
    font-size: .9em;
    color: #2489cd;
}

.footer {
    width: 100%;
    text-align: center;
    color: #999;
    font-size: .7em;
    /* margin-top: -10rpx; */
    margin-bottom: 10rpx;
}

@-webkit-keyframes fade {
    0% {
        opacity: 1;
    }

    25% {
        opacity: 0.5;
    }

    50% {
        opacity: 0;
    }

    75% {
        opacity: 0.5
    }

    100% {
        opacity: 1;
    }
}

.go-top {
    position: fixed;
    bottom: 20rpx;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.2em !important;
    -webkit-animation: fade 2s 1s infinite linear;
}

.empty {
    background-color: #fff;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    color: #ccc;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.empty span {
    font-size: 200rpx !important;
}

</style>
