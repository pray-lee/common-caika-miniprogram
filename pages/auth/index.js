import {request,validFn} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        checked: false,
    },
    onShow() {
        const sessionId = wx.getStorageSync('sessionId')
        !sessionId && wx.login({
            success: res => {
                if (res && res.code) {
                    this.handleLogin(res.code)
                }
            }
        })
    },
    addLoading() {
        if (app.globalData.loadingCount < 1) {
            wx.showLoading({
                content: '加载中...'
            })
        }
        app.globalData.loadingCount += 1
    },
    hideLoading() {
        if (app.globalData.loadingCount <= 1) {
            wx.hideLoading()
            app.globalData.loadingCount = 0
        } else {
            app.globalData.loadingCount -= 1
        }
    },
    handleLogin(code = '') {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'miniProgramController.do?login&code=' + code,
            method: 'GET',
            success: res => {
                let cookie = res.header['Set-Cookie']
                cookie = cookie.replace(/JSESSIONID/, ';JSESSIONID')
                wx.setStorageSync('sessionId', cookie)
            }
        })
    },
    getPhoneNumber(e) {
        if (e?.detail?.errMsg === "getPhoneNumber:ok") {
            const code = e.detail.code
            this.handlePhoneNumber(code)
        } else {
            validFn('用户未授权')
        }
    },
    handlePhoneNumber(code) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'miniProgramController.do?getPhoneNumber&code=' + code,
            method: 'GET',
            success: res => {
                if(res.data.success) {
                    wx.navigateTo({
                        url: '/pages/selectAccountbook/index'
                    })
                }
            }
        })
    },
    checkboxChange(e) {
        this.setData({
            checked: !this.data.checked
        })
        console.log(this.data.checked)
    },
    agree() {
        validFn('请阅读并同意用户需知与隐私政策')
    }
});