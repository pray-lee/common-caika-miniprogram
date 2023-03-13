App({
    onLaunch(options) {
        // 获取设备信息
        const {model, environment} = wx.getSystemInfoSync()
        const isIphoneXSeries = model.indexOf('iPhone X') !== -1
        this.globalData.isPhoneXSeries = isIphoneXSeries ? true : false
        this.globalData.isWxWork = environment ? true : false
    },
    onShow(options) {},
    globalData: {
        // url: 'https://www.caika.net/caika/',
        url: 'http://192.168.10.148:8080/jeecg/',
    }
});
