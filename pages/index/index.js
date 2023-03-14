import {getErrorMessage, request} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {},
    onShow() {
        this.addLoading()
        wx.login({
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
                const sessionId = wx.getStorageSync('sessionId')
                if (res.data && typeof res.data == 'string') {
                    getErrorMessage(res.data)
                } else {
                    if(!sessionId) {
                        let cookie = res.header['Set-Cookie']
                        cookie = cookie.replace(/JSESSIONID/, ';JSESSIONID')
                        wx.setStorageSync('sessionId', cookie)
                    }
                    if (res.data.success) {
                        const tenantList = res.data.result.tenantList
                        this.setUserInfo({
                            phoneNumber: res.data.result.phoneNumber,
                            tenantList
                        })
                        if(tenantList.length == 1) {
                            this.handleSystemLogin(tenantList[0].tenantCode)
                        }else if(tenantList.length < 1) {
                             validFn('暂未绑定系统，请联系管理员')
                        }else{
                            wx.navigateTo({
                                url: '/pages/selectAccountbook/index'
                            })
                        }
                    } else {
                        wx.navigateTo({
                            url: '/pages/auth/index'
                        })
                    }
                }
            },
            fail: err => {
                console.log('err', err)
            }
        })
    },
    handleSystemLogin(tenantCode) {
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'loginController.do?checkuserByPhoneNumber',
            method: 'POST',
            data: {
                phoneNumber: this.data.phoneNumber,
                tenantCode
            },
            success: res => {
                console.log(res, 'checkuserByPhoneNUmber')
            }
        })

    },
    setUserInfo({phoneNumber = null, tenantList = []}) {
        wx.setStorageSync('phoneNumber', phoneNumber)
        wx.setStorageSync('tenantList', tenantList)
    },
})