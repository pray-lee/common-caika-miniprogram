import {addLoading, hideLoading, getErrorMessage, request, validFn} from "../../util/getErrorMessage";
import '../../util/handleLodash'
var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {},
    onShow() {
        addLoading()
        wx.login({
            success: res => {
                hideLoading()
                if (res && res.code) {
                    this.handleLogin(res.code)
                }
            },
            fail: error => {
                console.log(error, 'error');
                validFn(error.errMsg)
            }
        })
    },
    handleLogin(code = '') {
        addLoading()
        request({
            url: app.globalData.url + 'miniProgramController.do?login&code=' + code,
            method: 'GET',
            success: res => {
                if (res.data && typeof res.data == 'string') {
                    getErrorMessage(res.data)
                } else {
                    if (res.data.success) {
                        const tenantList = res.data.result?.tenantList || []
                        const phoneNumber = res.data.result?.phoneNumber || ''
                        this.setUserInfo({
                            phoneNumber,
                            tenantList
                        })
                        wx.redirectTo({
                            url: '/pages/selectAccountbook/index'
                        })
                    } else {
                        wx.redirectTo({
                            url: `/pages/auth/index?openId=${res.data?.result?.openId}`
                        })
                    }
                }
            },
            fail: err => {
                console.log('err', err)
            }
        })
    },
    setUserInfo({phoneNumber = null, tenantList = []}) {
        wx.setStorageSync('phoneNumber', phoneNumber)
        wx.setStorageSync('tenantList', tenantList)
    },
})