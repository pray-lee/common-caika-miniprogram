Page({
    data: {},
    onShow() {
        const sessionId = wx.getStorageSync('sessionId')
        let t = setTimeout(() => {
            if (!sessionId) {
                wx.navigateTo({
                    url: '/pages/auth/index'
                })
            } else {
                // 进入小程序
                // 选择系统
                wx.navigateTo({
                    url: '/pages/selectAccountbook/index'
                })
            }
            clearTimeout(t)
            t = null
        }, 2000)
    }
})