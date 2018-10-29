import Config from './config'

export function checkTel(tel){
    if(!(/^1[34578]\d{9}$/.test(tel))){
        return false;
    }
    return true
}

export function dateSort(m, d) {
    // m, d 为Number
    let today = new Date();
    let now_month = Number(today.getMonth() + 1);
    let now_date = Number(today.getDate());
    if (m !== now_month) {
        return false
    } else if (d === now_date) {
        return '今天'
    } else if (d === now_date - 1) {
        return '昨天'
    } else if (d === now_date - 2) {
        return '前天'
    } else {
        return false
    }
}

export function hasInfoAuth() {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            // 查看是否授权
            success: res => {
                if(res.authSetting['scope.userInfo']) {
                    // 已经授权， 可以直接调用getUserInfo获取头像昵称
                    // 获取用户信息
                    wx.getUserInfo({
                        success: res => {
                            console.log('res.userInfo', res.userInfo);
                            resolve(res.userInfo)
                        },
                        fail: (e) => {
                            showModal('失败', e.errMsg)
                        }
                    });
                } else {
                    console.log('未授权');
                    showMsg('请先授权基本信息')
                    // resolve reject  疑惑
                    resolve(false)
                }
            }
        });
    })
}

export function switchTab(url) {
    return new Promise((resolve, reject) => {
        wx.switchTab({
            url,
            fail: (e) => {
                showModal('失败', e.errMsg)
            }
        })
    })
}

export function redirect(url) {
    return new Promise((resolve, reject) => {
        wx.redirectTo({
            url,
            fail: (e) => {
                console.log(e)
                showModal('失败', e.errMsg)
            }
        })
    })
}

export function navigate(url) {
    return new Promise((resolve, reject) => {
        wx.navigateTo({
            url,
            fail: (e) => {
                console.log(e)
                showModal('失败', e.errMsg)
            }
        })
    })
}

export function getSrcs(srcs) {
    let res = []
    if (srcs === null || srcs.length <= 0) {
        return res
    } else {
        let arr = srcs
        if (!(srcs instanceof Array)) {
            arr = srcs.split('|')
        }
        arr.forEach((src) => {
            res.push(Config['static_service'] + src)
        })
    }
    return res
}


export function wxLogin () {
    return new Promise((resolve, reject) => {
        wx.login({
            success: (res) => {
                if (res.code) {
                    resolve(res.code)
                } else {
                    showModal('失败','获取code失败')
                    reject(res)
                }
            }
        })
    })
}

export function uploadImg(tmp_src) {
    // 将图片上传到服务器
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: Config['service'] + '/api/v1/item/upload_img',
            filePath: tmp_src,
            name: 'img',
            success: res => {
                let data = JSON.parse(res.data);
                console.log('res.data', data)
                if (data.code === 1) {
                    resolve(data.data.imgServerPath)
                } else {
                    showModal('失败', data.data.msg)
                }
            }
        })
    })
}

export function get (url, data) {
    return request(url, 'GET', data)
}

export function post (url, data) {
    return request(url, 'POST', data)
}

export function del (url, data) {
    return request(url, 'DELETE', data)
}

function request (url, method, data, header = {}) {
    return new Promise((resolve, reject) => {
        wx.request({
            data,
            method,
            header,
            url: Config['service'] + url,
            success: function (res) {
                console.log('res', res)
                if (res.data.code === 1) {
                    res.data.data === null ? resolve(true) : resolve(res.data.data)
                } else {
                    console.log('post fail', res.data)
                    showModal('失败', res.data.msg || '服务器异常')
                    resolve(false)
                }
            },
            fail: function (res) {
                wx.getNetworkType({
                    success: (r) => {
                        if (r.networkType == "none") {
                            showModal('失败','网络异常')
                        } else {
                            showModal('失败', '服务器异常')
                        }
                    }
                })
                resolve(false)
            }
        })
    })
}

export function delConfirm () {
    return new Promise((resolve, reject) => {
        wx.showModal({
            title: '提示',
            content: '确定删除吗',
            success: (res) => {
                res.confirm ? resolve(true) : resolve(false)
            }
        })
    })
}

export function showLoading (title) {
    wx.showLoading({
        title
    })
}

export function hideLoading () {
    wx.hideLoading()
}

export function showModal (title, content) {
    wx.showModal({
        title,
        content,
        showCancel: false
    })
}

export function showSuccess (text) {
    wx.showToast({
        title: text,
        icon: 'success'
    })
}

export function showMsg (text) {
    wx.showToast({
        title: text,
        icon: 'none'
    })
}

export function getNowDate () {
    let newDate = new Date();
    let year = newDate.getFullYear();
    let month = String(newDate.getMonth() + 1).length === 1 ? '0' + (newDate.getMonth() + 1) : (newDate.getMonth() + 1);
    let day = String(newDate.getDate()).length === 1 ? '0' + newDate.getDate() : newDate.getDate();

    let nowDate = year + '-' + month + '-' + day;

    return nowDate;
}

export function getPreDate () {
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
}
