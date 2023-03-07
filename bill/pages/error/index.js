Page({
    data: {
        errorData: {
            type: 'empty',
            title: '什么都没有了',
            button: '返回',
            onButtbindtap: 'handleBack',
            href: '/bill/pages/home/home',
        },
    },
    handleBack() {
        wx.reLaunch({
            url: '/bill/pages/index/index'
        })
    },
    handleErrorButtbindtap(e) {
        const { dataset } = e.currentTarget;
        if (dataset.href) {
            wx.redirectTo({url: dataset.href});
        } else {
            console.warn('no href specified');
        }
    }
})
