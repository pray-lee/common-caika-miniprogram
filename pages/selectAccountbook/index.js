import {addLoading, hideLoading, request, validFn} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        tenantList: [],
        phoneNumber: '',
        error: false
    },
    onShow() {
        const tenantList = wx.getStorageSync('tenantList') || []
        const phoneNumber = wx.getStorageSync('phoneNumber') || ''
        this.setData({
            tenantList,
            phoneNumber
        })
        // 如果只有一个系统就直接跳到登录
        if(tenantList.length == 1) {
            this.handleSystemLogin(phoneNumber, tenantList[0].tenantCode)
        }
    },
    enter(e) {
        const tenantCode = e.currentTarget.dataset.code
        this.handleSystemLogin(this.data.phoneNumber, tenantCode)
    },
    handleSystemLogin(phoneNumber, tenantCode) {
        // 每次登录清理一下cookie, 要不然会串系统
        this.clearCookie()
        addLoading()
        request({
            url: app.globalData.url + 'loginController.do?checkuserByPhoneNumber',
            method: 'POST',
            data: {
                phoneNumber,
                tenantCode
            },
            success: res => {
                this.setCookie(res)
                if(res.data.success) {
                    // 去home页
                    wx.navigateTo({
                        url: "/pages/home/index"
                    })
                }else{
                    validFn(res.data.msg)
                }
            }
        })
    },
    clearCookie() {
        wx.setStorageSync('sessionId', '')
    },
    setCookie(res) {
        let cookie = res.header['Set-Cookie']
        cookie = cookie.replace(/JSESSIONID/, ';JSESSIONID')
            .replace(/,db=/, ';db=')
        console.log(cookie, 'coookie')
        wx.setStorageSync('sessionId', cookie)
    },
    close() {
        this.setData({
            error: false
        })
    }
})