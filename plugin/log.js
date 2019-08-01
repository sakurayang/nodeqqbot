const fs = require('fs');


/**
 * @constructor 创建一个字符串
 * @param {String|Number|Array} text Log text
 * @param {String} type Default: INFO
 */
class Text {
    constructor(text, type = 'INFO') {
        this.type = type;
        if (text == 'undefined' || text == null) {
            return `[${(new Date()).toISOString()}] [ERROR] text is undefined or null`;
        }
        else {
            return `[${(new Date()).toISOString()}] [${this.type}] ${JSON.stringify(text)}`;
        }
    }
}

function write(file) {
    
}