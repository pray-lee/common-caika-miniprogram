import {addLoading, hideLoading, getErrorMessage, request, validFn, qsString} from "../../util/getErrorMessage";
var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        checked: false,
        openId: '',
        queryParams: {},
    },
    onLoad(query) {
        const openId = query?.openId
        const queryParams = query?.querystring ? JSON.parse(query.querystring) : {}
        this.setData({
            openId,
            queryParams
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
                    const {tenantId, pageUrl} = this.data.queryParams
                    if(tenantId && pageUrl) {
                        this.handleSystemLogin(phoneNumber, this.data.queryParams)
                    }else{
                        wx.navigateTo({
                            url: '/pages/selectAccountbook/index'
                        })
                    }
                }else{
                    wx.showModal({
                        content: res.data.msg,
                        confirmText: '好的'
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
    },
    handleSystemLogin(phoneNumber, queryParams) {
        // 每次登录清理一下cookie, 要不然会串系统
        this.clearCookie()
        addLoading()
        request({
            url: app.globalData.url + 'loginController.do?checkuserByPhoneNumber',
            method: 'POST',
            data: {
                phoneNumber,
                tenantCode:queryParams?.tenantId
            },
            success: res => {
                this.setCookie(res)
                if(res.data.success) {
                    // 去home页
                    wx.redirectTo({
                        url: queryParams?.pageUrl + qsString(queryParams)
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
});