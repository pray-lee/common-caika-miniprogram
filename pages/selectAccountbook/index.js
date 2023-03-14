import {request} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        tenantList: [],
        phoneNumber: '',
        error: false
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
    onShow() {
        const tenantList = wx.getStorageSync('tenantList') || []
        const phoneNumber = wx.getStorageSync('phoneNumber') || ''
        this.setData({
            tenantList,
            phoneNumber
        })
        // 如果只有一个系统就直接跳到登录
        if(tenantList.length == 1) {
            this.handleSystemLogin(tenantList[0].tenantCode)
        }
    },
    enter(e) {
        const tenantCode = e.currentTarget.dataset.code
        this.handleSystemLogin(tenantCode)
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
    close() {
        this.setData({
            error: false
        })
    }
})