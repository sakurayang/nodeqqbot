const request = require('request'),
    crypto = require('crypto'),
    translate = require('../config.json').translate;
var youdao = {
    zh: "zh-CHS",
    en: "en",
    jp: "ja",
    kor: "ko",
    fra: "fr",
    spa: "es",
    pt: "pt",
    it: "it",
    ru: "ru",
    vie: "vi",
    de: "de",
    ara: "ar",
    id: "id"
};

async class Param {
    constructor(word, lang = "zh", type = "youdao") {
        this.word = (word == null || word == undefined) ? "error" : word;
        this.lang = String(lang);
        this.type = (type == null || type == undefined) ? "youdao" : type;
        this.url = translate[type].url;
        this.app_id = translate[type].app_id;
        this.sign_and_salt = getSignAndSalt(this.word, this.type);
        return {
            method: (this.type == "youdao" ? "GET" : "POST"),
            [this.type == "youdao" ? "qs" : "body"]: {
                q: (this.type == "youdao" ? encodeURIComponent(this.word) : this.word),
                from: "auto",
                to: (this.type == "youdao" ? youdao[lang] : lang),
                [this.type == "youdao" ? appKey : appid]: this.app_id,
                salt: this.sign_and_salt[0],
                sign: this.sign_and_salt[1],
                signType: "v3",
                curtime: this.sign_and_salt[2].toString()
            },
            headers: {
                "Content-Type": "application/json"
            }
        }
    }
    getSignAndSalt(word, type) {
        let app_id = translate[type].app_id;
        let sec_key = translate[type].sec_key;
        let str = type == "youdao" ?
            word <= 20 ?
            word :
            word.substring(0, 10) + word.length + word.substring(len - 10, len) : word;
        let time = new Date().getTime();
        let salt = time + Math.floor(Math.random() * 10000000);
        let sign = type == "youdao" ?
            crypto.createHash('md5').update(app_id + str + salt + time + sec_key).digest('hex') :
            crypto.createHash('md5').update(app_id + str + salt + sec_key).digest('hex');
        return [salt, sign, time]
    }
}

async function getTranslation(word, lang = "zh", type = "youdao") {
    let url = translate[type].url;
    let param = await new Param(word, lang, type);
    let result;
    await request(url, param, (err, res) => {
        if (err) throw Promise.reject(err);
        let body = res.body;
        json = JSON.parse(body);
        result = type == "youdao" ? json.translation[0] : json.trans_result[0].dst;
    });
    return Promise.resolve(result);
}

module.exports = {
    getTranslation: getTranslation
}