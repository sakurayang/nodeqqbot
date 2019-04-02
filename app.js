const http = require("http");
const fs = require("fs");
const requestLib = require("request");
const app = http.createServer();
const mysql = require('mysql');
const config = require("./config.json")

var address = config.address;
var debug = false;
var grep = /^@[\S\s]*/;

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
groups['all'] = ["118047250", "739889796"]

function send(type, send_text) {
    var conn = mysql.createConnection(config.db);
    conn.connect();
    for (let i = 0, len = groups[type].length; i < len; i++) {
        conn.query('select * from pause where group_id="' + groups[type][i] + '"', (err, result) => {
            if (result[0]['is_pause'] == undefined || result[0]['is_pause']) {
                console.log('pause');
                return null;
            } else {
                let text = `${address}group_id=${groups[type][i]}&message=${encodeURIComponent(send_text)}`;
                try {
                    debug ? console.log(text) : requestLib(text);
                } catch (error) {
                    console.log(error);
                }
            }
        });
    }
    conn.end();
}
app.on('request', function(req, res) {
    let post = '';
    req.on('data', function(chunk) {
        post += chunk;
    });

    req.on('end', function() {
        let dataDec = post;
        console.log(dataDec);
        if (dataDec != (null | undefined | '')) {
            let content = JSON.parse(dataDec);
            let title = content.Title;
            let postby = content.postBy;
            let postat = content.postat;
            let url = content.url;
            let type = content.type;
            let text = content.text;
            let from = content.from;
            if (text && grep.test(text)) {
                res.writeHead(403, { 'Content-type': 'text/html' });
                res.end();
            } else if (!url | !type) {
                res.writeHead(503, { 'Content-type': 'text/html' });
                res.end();
            } else {
                res.writeHead(200, { 'Content-type': 'text/html' });
                switch (from) {
                    case 'video':
                        let send_text = `${postby} |更新了：\n--------------\n${title}\n--------------\n视频地址：${url}\n--------------\n更新于：${postat}\n--------------\n提示：可使用!f:zh:xxxxxxx来翻译`;
                        break;
                    case 'twitter':
                        let send_text = `${postby} |发推了：\n--------------\n${text}\n--------------\n原文地址：${url}\n--------------\n更新于：${postat}\n--------------\n提示：可使用!f:zh:xxxxxxx来翻译`;
                        break;
                    default:
                        let send_text = `${postby} |更新了：\n--------------\n${title}\n--------------\n视频地址：${url}\n--------------\n更新于：${postat}\n--------------\n提示：可使用!f:zh:xxxxxxx来翻译`;
                        break;
                }
                //let urls = getUrl(send_text, type);
                //console.log(send_text);
                //console.log(urls);

                send(type, send_text);

            }

            fs.writeFile('./data.log', "\n" + send_text + "\n", { flag: 'a+', encoding: 'utf-8', mode: '0666' }, function(err, fd) {
                if (err) { return console.error(err); }
            });
            fs.writeFile('./data.log', post, { flag: 'a+', encoding: 'utf-8', mode: '0666' }, function(err, fd) {
                if (err) { return console.error(err); }
            });
            res.write("200 OK");
            res.end();

        } else {
            fs.writeFile('./data.log', "\nerror\n", { flag: 'a+', encoding: 'utf-8', mode: '0666' });
            res.writeHead(403, { 'Content-type': 'text/html' });
            res.write("error");
            res.end()
        }

    });
});
app.listen(8080, '0.0.0.0');

const file = http.createServer();
file.on('request', function(req, res) {
            let post = '';
            req.on('data', function(chunk) {
                post += chunk;
            });

            req.on('end', function() {
                        res.writeHead(200);
                        console.log(post);
                        let content = JSON.parse(post);
                        let name = content.name;
                        let url = content.url;
                        let type = content.type;
                        if (type == "jpeg" || type == "png" || type == "jpg" || type == "gif") {
                            res.writeHead(403, { "content-type": "text/plain" });
                            res.end();
                        } else if (type == "flv" || type == "mp4") {
                            res.writeHead(200, { "content-type": "text/plain" });
                            let text = `${address}776234515&message=${encodeURIComponent(`有新文件上传到Onedrive了\n文件名：${name}\n直链url：${url}`)}`;
            debug ? console.log(text) : requestLib(text);
            res.end();
        } else {
            res.writeHead(403, { "content-type": "text/plain" });
            res.end();
        }
    });
});
file.listen(8081, '0.0.0.0');

weekdays = ['日', '一', '二', '三', '四', '五', '六', '日'];
jpweekdays = ['日', '月', '火', '水', '木', '金', '土', '日'];
const timeline = http.createServer();
timeline.on('request', (req, res) => {
    let post = '';
    req.on('data', (chunk) => { post += chunk });
    req.on('end', () => {
        console.log(post);
        let content = JSON.parse(post);
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let week = date.getDay();
        let url = content.url;
        let name = content.name;
        let text = content.text;
        let time = content.time;
        if (name != "hololivetv") {
            res.writeHead(403);
            res.end()
        } else {
            res.writeHead(200,{"content-type":"text/plain"});
            res.write("200 OK")
            text = `各位早上好呀~\n今天是${year}年${month}月${day}日 星期${weekdays[week]} ${jpweekdays[week]}\n今天的hololive直播表如下\n▁▁▁▁▁▁▁▁▁▁\n${text}\n▔▔▔▔▔▔▔▔▔▔\n发布于${time}\n来源：${url}`
            send('all', text);
            res.end();
        }
    });
});
timeline.listen(8083, '0.0.0.0');