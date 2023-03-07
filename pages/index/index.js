Page({
    data: {},
    onShow() {
        console.log('show')
    },
    getPhoneNumber (e) {
        let detail = e.detail;
        // 允许 禁止
        console.log(detail);
    }
});