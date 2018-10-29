<template lang="html">
<div id="container">
<form @submit='formSubmit'>

    <radio-group @change="radioChange">
      <div v-if="item.itemType === 0">
        <label><radio value='0' checked = 'checked' />失物</label>
        <label><radio value='1' />招领</label>
      </div>
      <div v-else>
        <label><radio value='0' />失物</label>
        <label><radio value='1' checked = 'checked'/>招领</label>
      </div>
    </radio-group>

    <label for='itemName' id='itemNameLabel'>
        名称：
        <input id='itemName' name='itemName' :value="item.itemName" placeholder='输入物品名称'/>
    </label>

    <picker mode="date" :value="item.date" :start="preDate" :end="endDate" @change='bindDateChange'>
        <p v-if="itemType == 0"> 丢失时间：{{item.date}} </p>
        <p v-else> 捡到时间：{{item.date}} </p>
    </picker>

    <label for='placeInput' id='placeLabel'>
      <p>地点：</p>
      <input id='placeInput' :value="item.place" name='place' placeholder='输入地点' />
    </label>

    <button @tap='uploadImg' type='primary' :plain='true' size='mini'>上传图片</button>
    <img v-if="imgTempPath" :src='imgTempPath' />
    <template v-else>
        <img v-if="item.img" :src="item.img"/>
    </template>



    <div id="des">
        描述：
        <textarea placeholder='输入描述信息' name='des' :value="item.des"></textarea>
    </div>

    <button formType="submit" type='primary' size='mini'>提交</button>


</form>
</div>

</template>

<script>
import Config from '@/utils/config'

export default {
    data: {
        item: null,
        item_index: null,
        preDate: null,
        endDate: null,
        imgTempPath: null,
        service: Config['service']
    },

    beforeMount (query) {
        let item_id = Number(this.$root.$mp.query.item_id);
        console.log(query);

        let items = wx.getStorageSync('userItems');
        for(let i=0; i<items.length; i++) {
            if(items[i].id === item_id) {
                this.item = items[i],
                this.item_index =i,
                this.preDate = this.getPreDate(),
                this.endDate = this.getNowDate()
            }
        }
        console.log('item_index', this.item_index);
        console.log('item', this.item);
    },

    methods: {
        getNowDate () {
            let newDate = new Date();
            let year = newDate.getFullYear();
            let month = String(newDate.getMonth() + 1).length === 1 ? '0' + (newDate.getMonth() + 1) : (newDate.getMonth() + 1);
            let day = String(newDate.getDate()).length === 1 ? '0' + newDate.getDate() : newDate.getDate();

            let nowDate = year + '-' + month + '-' + day;

            return nowDate;
        },
        getPreDate () {
            let nowDate = this.getNowDate();
            let dateArr = nowDate.split('-');
            let nowMonth = Number(dateArr[1]);
            let preYear = Number(dateArr[0]); //number
            let preMonth = nowMonth-1;  // number
            let preDay = dateArr[2]; //string
            if(nowMonth === 1) {
                preYear = preYear - 1;
                preMonth = 12;
            }

            preMonth = String(preMonth).length === 1 ? '0' + String(preMonth) : String(preMonth);

            preYear = String(preYear);

            let preDate = preYear + '-' + preMonth + '-' + preDay;
            return preDate;
        },
        bindDateChange (e) {
            this.item.date = e.mp.detail.value;
            this.item = this.item
            conosle.log('date 修改完成');
        },

        radioChange (e) {
            this.item.itemType = Number(e.mp.detail.value);
            this.item = this.item
            console.log('type 修改完成');
        },

        uploadImg () {
            wx.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                success: res => {
                    console.log(res);
                    console.log(res.tempFilePaths[0]);
                    this.imgTempPath = res.tempFilePaths[0]
                }
            });
        },

        formSubmit (e) {
            let postData = {};
            postData.date = this.item.date;
            postData.itemType = this.item.itemType;
            postData.imgTempPath = this.imgTempPath;

            postData.itemName = e.mp.detail.value.itemName;
            postData.place = e.mp.detail.value.place;
            postData.des = e.mp.detail.value.des;

            console.log(postData);

            if (postData.imgTempPath === null) {
              // 图片未修改
              delete postData.imgTempPath;
              console.log('service', this.service)
              console.log('postData.img', this.item.img)
              postData.img = this.item.img.replace(this.service.replace('/service', ''),'');
              console.log('postData.img', postData.img)
              console.log('postData', postData);
              // 修改
              wx.request({
                url: this.service + '/api/v1/item/' + this.item.id,
                method: 'PUT',
                data: {
                  postData: postData
                },
                success: res => {
                  console.log(res);
                  if (res.data.code === 1) {
                    wx.showToast({
                      title: '修改成功'
                    });
                    let items = wx.getStorageSync('userItems');
                    items[this.item_index] = this.item;
                    wx.setStorageSync('userItems', items);
                    console.log(wx.getStorageSync('userItems'));
                    wx.redirectTo({
                        url: '/pages/itemsControl/main'
                    });
                  } else {
                    console.log('修改失败')
                    wx.showToast({
                      title: '服务器发生错误',
                      icon: 'none'
                    });
                    wx.navigateBack();
                    console.log('show toast')
                  }
                }
              });
            } else {
            // 将图片上传到服务器
            wx.uploadFile({
              url: this.service + '/api/v1/item/upload_img',
              filePath: postData.imgTempPath,
              name: 'img',
              success: res => {
                let data = JSON.parse(res.data);
                console.log(typeof(data));
                console.log('upload res data', data)
                if (data.code === 1) {
                  postData.img = data.userData.imgServerPath;
                  this.item.img = this.service + postData.img;
                  console.log(postData);
                  if (this.checkData(postData) === false) {
                    wx.showToast({
                      title: '所有字段不能为空',
                      icon: 'none'
                    });
                    return ;
                  }
                  // 将整个item post到服务器
                  wx.request({
                    url: this.service +  '/api/v1/item/' + this.item.id,
                    method: 'PUT',
                    data: {
                      postData: postData
                    },
                    success: res => {
                      console.log(res);
                      if (res.data.code === 1) {
                        wx.showToast({
                          title: '修改成功'
                        });
                        let items = wx.getStorageSync('userItems');
                        items[this.item_index] = this.item;
                        wx.setStorageSync('userItems', items);
                        wx.redirectTo({
                            url: '/pages/itemsControl/main'
                        });
                      } else {
                        console.log('修改失败')
                        wx.showToast({
                          title: '服务器发生错误',
                          icon: 'none'
                        });
                      }
                    }
                  });
                } else {
                  wx.showToast({
                    title: '上传图片失败',
                    icon: 'none'
                  });
                }
              }
            })
            }

        },

        checkData (postData) {
            if(!postData.date || !postData.des || !postData.img || !postData.itemName || !postData.place) {
              return false;
            } else {
              return true;
            }
        }
    }
}

</script>

<style lang="css">
</style>
