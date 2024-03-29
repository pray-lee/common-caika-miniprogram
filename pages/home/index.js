import {addLoading, hideLoading, loginFiled, formatNumber, request, validFn} from "../../util/getErrorMessage";

var app = getApp()
app.globalData.loadingCount = 0
Page({
    data: {
        isPhoneXSeries: false,
        animationInfo: {},
        maskHidden: true,
        list: [],
        oaList: [],
        statusObj: {
            10: "待提交",
            20: "待审批",
            25: "审批驳回",
            30: "已审批",
            60: "已提交付款",
            80: "已付款"
        },
        applicantType: {
            10: "职员",
            20: "供应商",
            30: "客户",
            40: 'kj'
        },
    },
    getPhoneNumber(e) {
        console.log(e.detail.code)
    },
    gotoOaList() {
        wx.navigateTo({
            url: '/bill/pages/oaList/index'
        })
    },
    gotoInvoiceList() {
        wx.removeStorageSync('accountbookId')
        wx.navigateTo({
            url: '/invoice/pages/invoiceList/index'
        })
    },
    getOaList() {
        const url = `${app.globalData.url}oaTaskController.do?todoDatagrid&field=id,applicationAmount,accountbookId,billType,billCode,taskName,billId,createDate,processInstanceId,remark,status`
        addLoading()
        request({
            url,
            method: 'POST',
            success: res => {
                if (res.statusCode === 200) {
                    const billTypes = ['4', '9', '3']
                    this.setData({
                        oaList: res.data.rows.filter(item => billTypes.includes(item.billType))
                    })
                }
            }
        })
    },
    onAddShow() {
        var animation = wx.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        animation.translateY(0).step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: false
        })
    },
    onAddHide() {
        var animation = wx.createAnimation({
            duration: 250,
            timeFunction: 'linear'
        })
        this.animation = animation
        animation.translateY('100%').step()
        this.setData({
            animationInfo: animation.export(),
            maskHidden: true
        })
    },
    doUpdate() {
        const updateManager = wx.getUpdateManager()

        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            console.log(res.hasUpdate)
        })

        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success(res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })

        updateManager.onUpdateFailed(function () {
            // 新版本下载失败
        })

    },
    onLoad(query) {
        this.setData({
            isPhoneXSeries: app.globalData.isPhoneXSeries
        })
    },
    onReady() {
    },
    getJiekuanList() {
        return new Promise((resolve, reject) => {
            addLoading()
            request({
                url: app.globalData.url + 'borrowBillController.do?datagrid&reverseVerifyStatus=0&page=1&rows=3&sort=updateDate&order=desc&status_end=79&field=id,,accountbookId,billCode,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankName_begin,incomeBankName_end,incomeBankAccount,incomeBankAccount_begin,incomeBankAccount_end,subject.fullSubjectName,auxpropertyNames,capitalTypeDetailEntity.detailName,amount,unpaidAmount,paidAmount,unverifyAmount,submitter.id,submitter.realName,invoice,contractNumber,submitDate,submitDate_begin,submitDate_end,status,businessDateTime,businessDateTime_begin,businessDateTime_end,remark,createDate,createDate_begin,createDate_end,updateDate,updateDate_begin,updateDate_end,accountbook.oaModule,',
                method: 'GET',
                success: res => {
                    resolve({
                        name: '借款单',
                        type: 'J',
                        list: res.data.rows
                    })
                }
            })
        })
    },
    getBaoxiaoList() {
        return new Promise((resolve, reject) => {
            addLoading()
            request({
                url: app.globalData.url + 'reimbursementBillController.do?datagrid&reverseVerifyStatus=0&page=1&rows=3&sort=createDate&order=desc&status_end=79&field=id,billCode,accountbookId,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,applicantType,applicantId,applicantName,incomeBankName,incomeBankAccount,invoice,applicationAmount,verificationAmount,totalAmount,unpaidAmount,paidAmount,unverifyAmount,businessDateTime,createDate,updateDate,remark,submitterId,submitter.realName,childrenCount,accountbook.oaModule,status',
                method: 'GET',
                success: res => {
                    resolve({
                        name: '报销单',
                        type: 'B',
                        list: res.data.rows
                    })
                }
            })
        })
    },
    getKaipiaoList() {
        return new Promise((resolve, reject) => {
            addLoading()
            request({
                url: app.globalData.url + 'invoicebillController.do?datagrid&page=1&rows=3&sort=createDate&order=desc&status_end=29&field=id,invoicebillCode,accountbookId,accountbookEntity.accountbookName,submitterId,user.realName,submitterDepartmentId,departDetailEntity.depart.departName,customerDetailId,customerDetailEntity.customer.customerName,invoiceType,createDate,taxRate,amount,unverifyAmount,unverifyReceivableAmount,submitDateTime,contacts,telephone,address,status,businessDateTime,remark,billCode',
                method: 'GET',
                success: res => {
                    resolve({
                        name: '开票申请单',
                        type: 'K',
                        list: res.data.rows
                    })
                }
            })
        })
    },
    getFukuanList() {
        return new Promise((resolve, reject) => {
            addLoading()
            request({
                url: app.globalData.url + 'paymentBillController.do?datagrid&reverseVerifyStatus=0&page=1&rows=3&sort=createDate&order=desc&status_end=79&field=id,billCode,accountbookId,accountbook.accountbookName,submitterDepartmentId,departDetail.depart.departName,supplierId,supplierDetail.supplier.supplierName,applicantType,applicantId,applicantName,submitterId,submitter.realName,incomeBankName,incomeBankAccount,invoice,applicationAmount,verificationAmount,totalAmount,unpaidAmount,paidAmount,unverifyAmount,businessDateTime,createDate,updateDate,remark,childrenCount,status,accountbook.oaModule,oaModule,',
                method: 'GET',
                success: res => {
                    resolve({
                        name: '付款申请单',
                        type: 'F',
                        list: res.data.rows
                    })
                }
            })
        })
    },
    getUserInfo() {
        addLoading()
        request({
            url: app.globalData.url + 'miniProgramController.do?getUserInfo',
            method: 'GET',
            // data:{},
            success: res => {
                if(res.data.success) {
                    const {realName, id} = res.data.obj
                    app.globalData.realName = realName
                    app.globalData.applicantId = id
                }else{
                    validFn(res.data.msg || '获取ERP用户信息失败')
                }
                console.log('用户信息', res)
            }
        })
    },
    onShow() {
        this.getUserInfo()
        this.doUpdate()
        // ============= 获取待办事项================
        this.getOaList()
        // ============= 获取待办事项================
        Promise.all([
            this.getJiekuanList(),
            this.getBaoxiaoList(),
            this.getKaipiaoList(),
            this.getFukuanList()
        ]).then(res => {
            // 添加单据类型标志 k j b f
            const promiseList = res.map(item => ({
                ...item,
                list: item.list.map(list => ({
                    ...list,
                    billType: item.type,
                    billName: item.name,
                    billClass: item.type.toLowerCase()
                }))
            }))
            // 合并四种单子
            const sortList = []
            promiseList.forEach(item => {
                sortList.push(...item.list)
            })
            // 合并之后排序，并且去前三个
            let sortableList = sortList.sort((a, b) => a.createDate < b.createDate ? 1 : -1).slice(0, 2)
            sortableList = sortableList.map(item => {
                if (item.totalAmount) {
                    item.formatTotalAmount = formatNumber(Number(item.totalAmount).toFixed(2))
                } else {
                    item.formatAmount = formatNumber(Number(item.amount).toFixed(2))
                }
                return item
            })
            this.setData({
                list: sortableList
            })
            console.log(this.data.list, 'list')
        })
        // 页面显示
        var animation = wx.createAnimation({
            duration: 250,
            timeFunction: 'ease-in'
        })
        this.animation = animation
        this.setData({
            animationInfo: animation.export()
        })
    },
    goToEdit(e) {
        const type = e.currentTarget.dataset.type
        const id = e.currentTarget.dataset.id
        const status = e.currentTarget.dataset.status
        console.log(type, id)
        switch (type) {
            case 'J':
                //借款
                if (status == 10 || status == 25) {
                    this.setPage(`/bill/pages/addJiekuan/index?type=edit&id=${id}`)
                } else {
                    this.setPage(`/viewBill/pages/viewJiekuan/index?id=${id}`)
                }
                break;
            case 'B':
                // 报销单
                if (status == 10 || status == 25) {
                    this.setPage(`/bill/pages/addBaoxiao/index?type=edit&id=${id}`)
                } else {
                    this.setPage(`/viewBill/pages/viewBaoxiao/index?id=${id}`)
                }
                break;
            case 'K':
                if (status == 10 || status == 25) {
                    this.setPage(`/bill/pages/addKaipiao/index?type=edit&id=${id}`)
                } else {
                    this.setPage(`/viewBill/pages/viewKaipiao/index?id=${id}`)
                }
                // 开票单
                break;
            case 'F':
                if (status == 10 || status == 25) {
                    this.setPage(`/bill/pages/addFukuan/index?type=edit&id=${id}`)
                } else {
                    this.setPage(`/viewBill/pages/viewFukuan/index?id=${id}`)
                }
                // 付款单
                break;
        }
    },
    setPage(url, id) {
        wx.navigateTo({
            url
        })
    },
    goList(e) {
        wx.navigateTo({
            url: '/bill/pages/list/index?type=' + e.currentTarget.dataset.type
        })
    },
    onShowAddJiekuan(e) {
        wx.navigateTo({
            url: '/bill/pages/addJiekuan/index?type=add'
        })
        this.onAddHide()
    },
    onShowAddKaipiao(e) {
        wx.navigateTo({
            url: '/bill/pages/addKaipiao/index?type=add'
        })
        this.onAddHide()
    },
    onShowAddFukuan(e) {
        wx.navigateTo({
            url: '/bill/pages/addFukuan/index?type=add'
        })
        this.onAddHide()
    },
    onShowAddBaoxiao(e) {
        wx.navigateTo({
            url: '/bill/pages/addBaoxiao/index?type=add'
        })
        this.onAddHide()
    },
    onHide() {
        // 页面隐藏
    },
    onUnload() {
        // 页面被关闭
    },
    onTitleClick() {
        // 标题被点击
        console.log('title clicked')
    },
    onPullDownRefresh() {
        console.log(1121)
        // 页面被下拉
    },
    onReachBottom() {
        // 页面被拉到底部
    },
});
