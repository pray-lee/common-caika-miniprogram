import {getErrorMessage, request, validFn} from "../../util/getErrorMessage";
var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        checked: false,
    },
    onShow() {},
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
        this.addLoading()
        request({
            hideLoading: this.hideLoading,
            url: app.globalData.url + 'miniProgramController.do?getPhoneNumber&code=' + code,
            method: 'GET',
            success: res => {
                if (res.data && typeof res.data == 'string') {
                    getErrorMessage(res.data)
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
                }
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