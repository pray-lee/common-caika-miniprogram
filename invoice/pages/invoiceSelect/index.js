import {cloneDeep as clone } from "lodash";
import {addLoading, hideLoading, formatNumber, request} from '../../../util/getErrorMessage'
var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        startX: 0, //开始坐标
        startY: 0,
        isPhoneXSeries: false,
        list: [],
        accountbookIndex: 0,
        accountbookList: [],
        accountbookDisabled: false,
    },
    //手指触摸动作开始 记录起点X坐标
    touchstart: function (e) {
        //开始触摸时 重置所有删除
        this.data.list.forEach(function (v, i) {
            if (v.isTouchMove)//只操作为true的
                v.isTouchMove = false;
        })
        this.setData({
            startX: e.changedTouches[0].clientX,
            startY: e.changedTouches[0].clientY,
            list: this.data.list,
        })
    },
    //滑动事件处理
    touchmove: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index,//当前索引
            startX = that.data.startX,//开始X坐标
            startY = that.data.startY,//开始Y坐标
            touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
            touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
            //获取滑动角度
            angle = that.angle({X: startX, Y: startY}, {X: touchMoveX, Y: touchMoveY});
        that.data.list.forEach(function (v, i) {
            v.isTouchMove = false
            //滑动超过30度角 return
            if (Math.abs(angle) > 30) return;
            if (i == index) {
                if (touchMoveX > startX) //右滑
                    v.isTouchMove = false
                else //左滑
                    v.isTouchMove = true
            }
        })
        //更新数据
        that.setData({
            list: that.data.list,
        })
    },
    /**
     * 计算滑动角度
     * @param {Object} start 起点坐标
     * @param {Object} end 终点坐标
     */
    angle: function (start, end) {
        var _X = end.X - start.X,
            _Y = end.Y - start.Y
        //返回角度 /Math.atan()返回数字的反正切值
        return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
    },
    onShow() {
        this.getEditInvoiceDetailFromStorage()
    },
    onLoad(query) {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries,
        })
        this.getAccountbookList(query.invoiceAccountbookId)
        this.getOcrListFromStorage()
    },
    onHide() {},
    getAccountbookList(invoiceAccountbookId) {
        addLoading()
        request({
            url: app.globalData.url + 'invoiceConfigController.do?getAccountbookListByUserId&userId=' + app.globalData.applicantId,
            method: 'GET',
            success: res => {
                if(res.statusCode === 200) {
                    if(res.data && res.data.length) {
                        var accountbookIndex = 0
                        var accountbookId = res.data[0].id
                        const accountbookIdStorage = wx.getStorageSync('accountbookId')
                        if(accountbookIdStorage) {
                            this.setData({
                                accountbookDisabled: true
                            })
                            res.data.forEach((item, index) => {
                                if (item.id === accountbookIdStorage) {
                                    accountbookIndex = index
                                    accountbookId = accountbookIdStorage
                                }
                            })
                            wx.removeStorage({
                                key: 'accountbookId'
                            })
                        }else{
                            res.data.forEach((item, index) => {
                                if (item.id === invoiceAccountbookId) {
                                    accountbookIndex = index
                                    accountbookId = invoiceAccountbookId
                                }
                            })
                            this.setData({
                                accountbookDisabled: false
                            })
                        }
                        this.setData({
                            accountbookList: res.data,
                            accountbookIndex: accountbookIndex,
                        })
                    }else{
                        wx.showModal({
                            content: res.data.msg,
                            confirmText: '好的',
                            showCancel: false,
                            success: res => {
                                wx.reLaunch({
                                    url: '/pages/home/index'
                                })
                            }
                        })
                    }
                }
            },
        })
    },
    bindObjPickerChange(e) {
        var name = e.currentTarget.dataset.name
        var listName = e.currentTarget.dataset.list
        var value = e.detail.value
        var index = e.currentTarget.dataset.index
        if(name !== 'accountbookId') {
            this.setData({
                [index]: e.detail.value,
            })
        }else{
            this.setData({
                [index]: e.detail.value,
            })
        }
    },
    getOcrListFromStorage() {
        const list = wx.getStorageSync('ocrList')
        if(list && list.length) {
            this.setData({
                list: list.map(item => ({
                    ...item,
                    formatJshj: formatNumber(Number(item.jshj).toFixed(2)),
                    uploadType: '2',
                }))
            })
            wx.removeStorage({
                key:'ocrList',
                success: () => {}
            })
        }
    },
    getEditInvoiceDetailFromStorage() {
        const editInvoiceDetail = wx.getStorageSync('editInvoiceDetail')
        wx.removeStorage({
            key: 'editInvoiceDetail',
            success: () => {}
        })
        const index = wx.getStorageSync('editInvoiceDetailIndex')
        if(editInvoiceDetail) {
            const newList = clone(this.data.list)
            newList[index] = editInvoiceDetail
            this.setData({
                list: newList.map(item => ({
                    ...item,
                    formatJshj: formatNumber(Number(item.jshj).toFixed(2))
                }))
            })
            wx.removeStorage({
                key: 'editInvoiceDetail'
            })
            wx.removeStorage({
                key: 'editInvoiceDetailIndex'
            })
        }
    },
    goToEdit(e) {
        const index = e.currentTarget.dataset.index
        wx.setStorageSync(
            'editInvoiceDetailIndex',
            index
        )
        wx.setStorageSync(
            'accountbookId',
            this.data.accountbookList[this.data.accountbookIndex]
        )
        wx.setStorage({
            key: 'editInvoiceDetail',
            data: this.data.list[index],
            success: () => {
                wx.navigateTo({
                    url: '/invoice/pages/invoiceInput/index'
                })
            }
        })
    },
    deleteInvoice(e) {
        wx.showModal({
            title: '温馨提示',
            content: '确认删除该发票吗?',
            confirmText: '是',
            cancelText: '否',
            cancelColor: '#ff5252',
            success: res => {
                if(res.confirm) {
                    const index = e.currentTarget.dataset.index
                    const tempList = clone(this.data.list)
                    tempList.splice(index, 1)
                    this.setData({
                        list: tempList
                    })
                }
            }
        })
    },
    submitOcrList() {
        const submitData = this.data.list.map(item => ({
            ...item,
            accountbookId: this.data.accountbookList[this.data.accountbookIndex].id
        }))
        wx.setStorage({
            key: 'selectOcrList',
            data: submitData,
            success: res => {
                wx.navigateBack({
                    delta: 1
                })
            }
        })
    }
})
