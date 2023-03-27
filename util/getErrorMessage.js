const app = getApp()
const getErrorMessage = string => {
    const error = string.match(/<\/P>[\W\w]+<P>/gi)[0]
    const newError = error.replace(/<[^>]+>/gi, "")
    const result = newError.replace(/[\r\n]/gi, "")
    wx.showModal({
        content: result,
        confirmText: '确定',
        showCancel: false,
        success: () => {
        },
    });
}
const addLoading = () => {
    if (app.globalData.loadingCount < 1) {
        wx.showLoading({
            content: '加载中...',
            mask: true,
        })
    }
    app.globalData.loadingCount += 1
}
const hideLoading = () => {
    if (app.globalData.loadingCount <= 1) {
        wx.hideLoading()
        app.globalData.loadingCount = 0
    } else {
        app.globalData.loadingCount -= 1
    }
}

const submitSuccess = () => {
    console.log('submit success...')
    wx.reLaunch({
        url: '/pages/home/index'
    })
}

const loginFiled = (msg = "") => {
    wx.showModal({
        title: '登录失败',
        content: msg,
        confirmText: '确定',
        showCancel: false,
        success: () => {
            wx.reLaunch({
                url: '../error/index'
            })
        },
    });
}
const formatNumber = (num) => {
    return num && num.toString().replace(/\d+/, function (s) {
        return s.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
    })
}

const validFn = message => {
    wx.showModal({
        content: message,
        confirmText: '确定',
        showCancel: false,
        success: () => {
        },
    })
}

const request = option => {
    const sessionId = wx.getStorageSync('sessionId')
    wx.request({
        url: option.url,
        dataType: 'json',
        data: option.data,
        header: {
            'cookie': sessionId,
            'content-type': option.headers ? option.headers['Content-Type'] : 'application/x-www-form-urlencoded',
        },
        method: option.method,
        success: res => {
            console.log(new Date(), option.url)
            if (typeof res.data !== 'string' || res.data.indexOf('主框架') === -1) {
                option.success(res)
            } else {
                // wx.removeStorage({
                //     key: 'sessionId',
                //     success: res => {
                //         console.log('清除sessionId成功')
                //     }
                // })
            }
        },
        fail: res => {
            if (typeof option.fail === 'function') {
                option.fail(res)
            }
        },
        complete: res => {
            hideLoading()
            if (typeof option.complete === 'function') {
                option.complete(res)
            }
            if (res.statusCode == '404') {
                validFn('404, 发生请求错误')
            }
        }
    })
}

export {
    addLoading,
    hideLoading,
    getErrorMessage,
    submitSuccess,
    loginFiled,
    formatNumber,
    validFn,
    request
}
