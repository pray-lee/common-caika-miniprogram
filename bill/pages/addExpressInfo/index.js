import {addLoading, hideLoading, request} from '../../../util/getErrorMessage'
const app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        expressInfo: {},
        type: 'add'
    },
    onLoad(query) {
        if(!!query.type && query.type === 'edit') {
            const expressInfo = wx.getStorageSync('expressInfo')
            this.setData({
                expressInfo,
                type: query?.type
            })
        }
    },
    updateInfo() {
    },
    bindKeyInput(e) {
        this.setData({
            expressInfo: {
                ...this.data.expressInfo,
                [e.currentTarget.dataset.type]: e.detail.value
            }
        })
    },
    save() {
        const customerDetailId = wx.getStorageSync('customerDetailId')
        this.setData({
            expressInfo: {
                ...this.data.expressInfo,
                customerDetailId
            }
        })
        addLoading()
        const url = app.globalData.url + (this.data.type === 'edit' ?
            'customerSpecialDeliveryController.do?doUpdate' :
            'customerSpecialDeliveryController.do?doAdd' )
        request({
            url: url,
            method: 'POST',
            data: this.data.expressInfo,
            success: res => {
                this.once()
            }
        })
    },
    once() {
        wx.setStorage({
            key: 'expressInfo',
            data: this.data.expressInfo,
            success: () => {
                wx.navigateBack({
                    delta: 2
                })
            }
        })
    },
})
