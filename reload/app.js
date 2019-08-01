const http = require("http"),
    fs = require("fs"),
    requestLib = require("request"),
    app = http.createServer(),
    mysql = require('mysql'),
    config = require("./config.json"),
    {
        registerFont,
        createCanvas
    } = require('canvas'),
    emoji = require('node-emoji');

var address = config.address;
var debug = 0;
var grep = /^@[\S\s]*/;
var date = new Date(),
    year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate(),
    week = date.getDay(),
    weekdays = ['日', '一', '二', '三', '四', '五', '六', '日'],
    jpweekdays = ['日', '月', '火', '水', '木', '金', '土', '日'];

registerFont("./fonts/NotoSansCJKjp-Regular.ttf", {
    "family": "NotoSans"
});

var groups = new Array();
/*AIC字幕组群：190674121
 *AIC粉丝1群：118047250
 *富士葵粉丝群：634725864
 *PHH粉丝群：739889796
 *akebi群：776234515
 */
groups["AIC"] = ["190674121", "118047250"];
groups["LUNA"] = ["118047250", "739889796"];
groups["AKARI"] = ["118047250"];
groups["SIRO"] = ["118047250"];
groups["AOI"] = ["634725864"];
groups["PPH"] = ["118047250", "739889796"];
groups["IKUNA"] = ["739889796", "118047250"];
groups["kotobumi"] = ["776234515"];
groups['all'] = ["118047250", "739889796", "591845717"];
//groups['all'] = ["118047250"];

/* function getJSON(chunk) {
    let content = {};
    let raw = chunk.toString();
    raw = raw.replace(/"/ig, '').replace(/}/ig, '').replace(/{/ig, '');
    raw = raw.split(",");
    raw.forEach(value => {
        let splitit = value.split(":");
        content[splitit[0]] = splitit[1];
    });
    return content;
} */

function send(type, send_text) {
    var conn = mysql.createConnection(config.db);
    conn.connect();
    if (groups[type]) {
        for (let i = 0, len = groups[type].length; i < len; i++) {
            conn.query('select * from pause where group_id="' + groups[type][i] + '"', (err, result) => {
                if (result[0]['is_pause'] == undefined || result[0]['is_pause']) {
                    console.log('pause');
                    return null;
                } else {
                    try {
                        debug ? console.log(send_text) :
                            requestLib({
                                url: address,
                                method: 'POST',
                                json: {
                                    group_id: groups[type][i],
                                    message: send_text
                                }
                            });
                    } catch (error) {
                        console.log(error);
                    }
                }
            });
        }
    }
    conn.end();
}


app.on('request', function (req, res) {
    var post = "";
    req.on('data', function (chunk) {
        //content = getJSON(chunk);
        post += chunk;
        content = JSON.parse(post);
    });

    req.on('end', function () {
        console.log(content);
        let postby = content.postBy,
            postat = content.postat,
            url = content.url,
            type = content.type,
            text = content.text,
            from = content.from;
        if (text && grep.test(text)) {
            res.writeHead(403, {
                'Content-type': 'text/html'
            });
            res.end();
        } else {
            res.writeHead(200, {
                'Content-type': 'text/html'
            });
            switch (from) {
                case 'video':
                    var send_text =
                        `${postby} |更新了：
--------------
${title}
--------------
视频地址：${url}
--------------
更新于：${postat}
--------------
提示：可使用.f:zh:xxxxxxx来翻译`;
                    break;
                case 'twitter':
                    var send_text =
                        `${postby} |发推了：
--------------
${text}
--------------
原文地址：${url}
--------------
更新于：${postat}
--------------
提示：可使用.f:zh:xxxxxxx来翻译`;
                    break;
                default:
                    var send_text =
                        `${postby} |更新了：
--------------
${title}
--------------
视频地址：${url}
--------------
更新于：${postat}
--------------
提示：可使用.f:zh:xxxxxxx来翻译`;
                    break;
            }
            //let urls = getUrl(send_text, type);
            //console.log(send_text);
            //console.log(urls);

            send(type, send_text);

        }

        fs.writeFile('./data.log', "\n" + send_text + "\n", {
            flag: 'a+',
            encoding: 'utf-8',
            mode: '0666'
        }, function (err, fd) {
            if (err) {
                return console.error(err);
            }
        });
        fs.writeFile('./data.log', content, {
            flag: 'a+',
            encoding: 'utf-8',
            mode: '0666'
        }, function (err, fd) {
            if (err) {
                return console.error(err);
            }
        });
        //res.write("200 OK");
        res.end();

    });
});
app.listen(8080, '0.0.0.0');