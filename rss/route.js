const randomUA = require('random-fake-useragent');


class Uri {
    /**
     * @param {String} address 地址
     * @param {String{POST|GET}} method 调用方法
     * @param {JSON|String} header
     * @param {JSON|String} body
     * @param {JSON|String} others
     */
    constructor(address, method = "POST", header, body = {}, others = {}) {
        this.address = String(address);
        this.headers = (typeof (header) == 'undefined' || header == {}) ? {
            "Accept": "application/json"
        } : JSON.stringify(header);
        this.method = (method == "POST") ? method : ((method == "GET") ? method : "POST");
        // if method == POST or GET ,method = method. else method = POST
        this.body = ((body == null) || (typeof (body) == 'undefined')) ? {
            limit: 1
        } : body;
        this.others = ((others == null) || (typeof (others) == 'undefined')) ? {} : others;
        return (this.method == 'POST') ? {
            url: this.address,
            options: {
                method: this.method,
                headers: this.headers,
                body: this.body,
                ...this.others,
            }
        } : (this.method == 'GET') ? {
            url: this.address,
            options: {
                method: this.method,
                headers: this.headers,
            }
        } : {}
    };
}


/**
 * 
 * @param {String} id 即刻 id
 * @param {String:Topic|People} type 类型
 */
function Jike(id, type) {
    let _id = (id == null || id == '' || typeof (id) == 'undefined') ? false : id;
    let _type = (type == null || type == '' || typeof (type) == 'undefined') ? 'topic' : type;
    let url = (String(_type).toLocaleUpperCase() == 'TOPIC') ?
        'https://app.jike.ruguoapp.com/1.0/messages/history' :
        (String(_type).toLocaleUpperCase() == 'USER') ?
        'https://app.jike.ruguoapp.com/1.0/personalUpdate/single' :
        (String(_type).toLocaleUpperCase() == 'DAILY') ?
        'https://app.jike.ruguoapp.com/1.0/dailies/list' :
        'error';
    let method = (String(_type).toLocaleUpperCase() == 'TOPIC') ?
        'POST' :
        (String(_type).toLocaleUpperCase() == 'USER') ?
        'POST' :
        (String(_type).toLocaleUpperCase() == 'DAILY') ?
        'GET' :
        'POST';
    let body = (String(_type).toLocaleUpperCase() == 'TOPIC') ? {
            "loadMoreKey": null,
            "topic": _id,
            "limit": 1,
        } :
        (String(_type).toLocaleUpperCase() == 'USER') ? {
            "username": _id,
            "limit": 1,
        } : {};
    let options = JSON.parse(JSON.stringify(new Uri(url, method, {
        "User-Agent": randomUA.getRandom()
    }, body, {
        json: true
    })));
    return options;
}



//https://m.okjike.com/officialMessages/id
//即刻官方圈子消息，如即刻小报，一觉醒来
//https://m.okjike.com/originalMessages/id
//非官方圈子
//https://www.okjike.com/medium/id
//一觉醒来

module.exports = {
    Jike: Jike,
};