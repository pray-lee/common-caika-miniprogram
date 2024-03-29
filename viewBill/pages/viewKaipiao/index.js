import {cloneDeep as clone} from "lodash";
import {addLoading, hideLoading, formatNumber, request} from "../../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        // 增加申请人
        realName: '',
        result: null,
        isPhoneXSeries: false,
    },
    previewFile(e) {
        var url = e.currentTarget.dataset.url
        wx.previewImage({
            urls: [url],
        })
    },
    onLoad(query) {
        // 增加申请人
        this.setData({
            realName: app.globalData.realName
        })
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
        addLoading()
        const id = query.id
        request({
            url: app.globalData.url + 'invoicebillController.do?getDetail&id=' + id,
            method: 'GET',
            success: res => {
                if (res.data.obj) {
                    const result = clone(res.data.obj)
                    result.businessDateTime = result.businessDateTime.split(' ')[0]
                    result.billDetailList.forEach(item => {
                        item.formatApplicationAmount = formatNumber(Number(item.applicationAmount).toFixed(2))
                        if(item.subjectEntity.fullSubjectName.indexOf('_') !== -1){
                            item.subjectName = item.subjectEntity.fullSubjectName.split('_')[item.subjectEntity.fullSubjectName.split('_').length-1]
                        }else{
                            item.subjectName = item.subject.fullSubjectName
                        }
                    })
                    this.setData({
                        result
                    })
                }
            }
        })
    },
    showKaipiaoDetail(e) {
        const index = e.currentTarget.dataset.index
        const tempData = clone(this.data.result.billDetailList[index])
        wx.setStorage({
            key: 'kaipiaoDetail',
            data: tempData,
            success: res => {
                wx.navigateTo({
                    url: '/viewBill/pages/viewKaipiaoDetail/index'
                })
            }
        })
    },
    rollBack() {
        addLoading()
        request({
            url: app.globalData.url + 'invoicebillController.do?doBatchTemporaryStorage&ids=' + this.data.result.id,
            method: 'GET',
            success: res => {
                if(res.data.success) {
                    wx.redirectTo({
                        url: `/bill/pages/addKaipiao/index?type=edit&id=${this.data.result.id}`
                    })
                }else{
                    wx.showModal({
                        content: '撤回失败',
                        confirmText: '好的',
                        showCancel: false,
                    })
                }
            }
        })
    }
})
