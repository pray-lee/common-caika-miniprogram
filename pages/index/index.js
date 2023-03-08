import {request} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        loginStatus: ''
    },
    onShow() {
        const sessionId = wx.getStorageSync('sessionId')
        if(!sessionId) {
            wx.login({
                success: res => {
                    if (res && res.code) {
                        this.handleLogin(res.code)
                    }
                }
            })
        }else {
            // 进入小程序
            this.setLoginStatus(true)
        }
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
                if(!res.success) {
                    let cookie = res.header['Set-Cookie']
                    cookie = cookie.replace(/JSESSIONID/, ';JSESSIONID')
                    wx.setStorageSync('sessionId', cookie)
                    this.setLoginStatus(true)
                }
            }
        })
    },
    setLoginStatus(loginStatus) {
        this.setData({
            loginStatus
        })
    },
    getPhoneNumber(e) {
        if(e?.detail?.errMsg === "getPhoneNumber:ok") {
            const code = e.detail.code
            console.log(this.data)
            this.data.loginStatus && this.handlePhoneNumber(code)
        }else{
            // 走介绍页
        }
    },
    handlePhoneNumber(code) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'miniProgramController.do?getPhoneNumber&code=' + code,
            method: 'GET',
            success: res => {
                console.log(res, 'getphone res')
            }
        })
    }

});