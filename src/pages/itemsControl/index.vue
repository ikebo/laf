<template lang="html">
<div class="">
    <div id="container">
        <Item :item='item' :isControl='true' v-for='item of items' :key='item.id'></Item>
    </div>
    <div class="empty iconfont" v-if="empty">
        <span>&#xe724;</span>
        <p>暂无数据</p>
    </div>
</div>
</template>

<script>
import {get,showLoading,hideLoading} from '@/utils/util'
import Item from '@/components/Item'

export default {
    data: {
        items: [],
        page: 0,
        more: true,
        user_id: null
    },

    computed: {
        empty () {
            return this.items.length == 0 ? true : false
        }
    },

    components: {
        Item
    },

    methods: {
        editItem (e) {
            let item_id = e.target.dataset.itemid;
            console.log('item_id', item_id);
            wx.redirectTo({
              url: '/pages/editItem/main?item_id=' + item_id
            });
        },

        async getItems() {
            let items = await get(`/api/v1/item/${this.user_id}`)
            this.items = items
            hideLoading()
            wx.stopPullDownRefresh()
            console.log('this.items', this.items)
        }
    },

    // mounted 之后才能调用methods中的方法
    mounted () {
        showLoading('请稍后')
        console.log('itemsControl', this.$root.$mp.query)
        this.user_id = Number(this.$root.$mp.query.id)
        this.getItems()
    },

    onPullDownRefresh () {
        this.getItems()
    }
}
</script>

<style lang="css">
#container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  background-color: #eee;
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
