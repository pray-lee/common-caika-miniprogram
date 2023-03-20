import {addLoading, hideLoading, getErrorMessage, request, validFn} from "../../util/getErrorMessage";
var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        checked: false,
        openId: ''
    },
    onLoad(query) {
        const openId = query?.openId
        this.setData({
            openId
        })
    },

    onShow() {},
    getPhoneNumber(e) {
        if (e?.detail?.errMsg === "getPhoneNumber:ok") {
            const code = e.detail.code
            this.handlePhoneNumber(code)
        } else {
            validFn('小程序暂未获得您的授权')
        }
    },
    setUserInfo({phoneNumber = null, tenantList = []}) {
        wx.setStorageSync('phoneNumber', phoneNumber)
        wx.setStorageSync('tenantList', tenantList)
    },
    handlePhoneNumber(code) {
        addLoading()
        request({
            url: app.globalData.url + 'miniProgramController.do?getPhoneNumber&code=' + code + '&openId=' + this.data.openId,
            method: 'GET',
            success: res => {
                if (res.data && typeof res.data == 'string') {
                    getErrorMessage(res.data)
                }
                if (res.data.success) {
                    const tenantList = res.data.result?.tenantList || []
                    const phoneNumber = res.data.result?.phoneNumber || ''
                    this.setUserInfo({
                        phoneNumber,
                        tenantList
                    })
                    wx.navigateTo({
                        url: '/pages/selectAccountbook/index'
                    })
                }
            },
        })
    },
    checkboxChange(e) {
        this.setData({
            checked: !this.data.checked
        })
    },
    agree() {
        validFn('请阅读并同意用户需知与隐私政策')
    }
});