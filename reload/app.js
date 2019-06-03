const http = require("http"),
    fs = require("fs"),
    requestLib = require("request"),
    app = http.createServer(),
    mysql = require('mysql'),
    config = require("./config.json"), 
    { registerFont, createCanvas } = require('canvas'),
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

registerFont("./fonts/NotoSansCJKjp-Regular.ttf", { "family": "NotoSans" });

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

function sendImage(html) {
    let text = '';
    text += html;
    if (text == '') console.log("no value");
    let split_text = emoji.replace(text, (emoji) => '').replace(/\ufffd/ig, '').split(' ');
    split_text[1] = split_text[0] + split_text[1];
    split_text.shift();
    split_text.pop();
    let line = split_text.length;
    console.log(split_text);
    let text_width = new Array(),
        width = new Array();
    split_text.forEach((value, index) => {
        text_width[index] = { "value": value, "width": value.length };
        width[index] = value.length;
    });
    width.sort((a, b) => a - b);
    let index = text_width.findIndex((value) => value.width == width[width.length - 1]);

    /* Draw a canvas
     *1 ┌────────────────────────────────────
     *2 │                                     20px 
     *3 │                Title                30px
     *4 │-------------------------------------5 px---\
     *5 │                                     15px---/ 
     *6 │<=15px=>This is a Line               20px
     *7 │        This is a Line                 │
     *8 │        This is a Line                 │
     *9 │        This is a Line                 │
     *10│        This is the longest Line<=5px=>│
     *11│                                     20px
     *12└────────────────────────────────────
     */
    let a = new createCanvas(1, 1);
    const b = a.getContext('2d');
    b.font = '30px "NotoSans"';
    /*只用一次所以变量名就随便了*/
    let canvas_width = b.measureText(text_width[index].value).width + 20,
        canvas_height = line * 30 + 60;
    let canvas = new createCanvas(canvas_width, canvas_height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas_width, canvas_height);

    ctx.font = '10px "NotoSans"';
    ctx.textAlign = 'end';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#272727';
    ctx.fillText("Power By node-canvas, program by Gerard V0.4-beta", canvas_width, 10);

    ctx.font = '30px "NotoSans"';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText(split_text[0], canvas_width / 2, 60);

    ctx.beginPath();
    ctx.moveTo(10, 62);
    ctx.lineTo(canvas_width - 10, 62);
    ctx.stroke();

    ctx.font = '20px "NotoSans"';
    ctx.textAlign = 'start';
    for (let i = 1, len = split_text.length; i < len; i++) {
        const text = split_text[i];
        let lineNum = i - 1;
        ctx.fillText(text, 15, 100 + 25 * lineNum);
    }

    ctx.font = '10px "NotoSans"';
    ctx.textAlign = 'end';
    ctx.fillStyle = '#272727';
    ctx.fillText(`${year}年${month}月${day}日 星期${weekdays[week]} ${jpweekdays[week]}曜日`, canvas_width, canvas_height);

    var base64 = canvas.toDataURL().substr(22);
    //console.log(base64);
    send('all', `[CQ:image,file=base64://${base64}]`);
}


app.on('request', function(req, res) {
    var post = "";
    req.on('data', function(chunk) {
        //content = getJSON(chunk);
        post += chunk;
        content = JSON.parse(post);
    });

    req.on('end', function() {
        console.log(content);
        let postby = content.postBy,
            postat = content.postat,
            url = content.url,
            type = content.type,
            text = content.text,
            from = content.from;
        if (text && grep.test(text)) {
            res.writeHead(403, { 'Content-type': 'text/html' });
            res.end();
        } else {
            res.writeHead(200, { 'Content-type': 'text/html' });
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

        fs.writeFile('./data.log', "\n" + send_text + "\n", { flag: 'a+', encoding: 'utf-8', mode: '0666' }, function(err, fd) {
            if (err) { return console.error(err); }
        });
        fs.writeFile('./data.log', content, { flag: 'a+', encoding: 'utf-8', mode: '0666' }, function(err, fd) {
            if (err) { return console.error(err); }
        });
        //res.write("200 OK");
        res.end();

    });
});
app.listen(8080, '0.0.0.0');


const timeline = http.createServer();
timeline.on('request', (req, res) => {
    //let content = {};
    req.on('data', (chunk) => {
        //content = getJSON(chunk);
        content = JSON.parse(chunk.toString());
    });
    req.on('end', () => {
        let name = content.name,
            text = emoji.replace(content.text, (emoji) => '');
        console.log(text);
        if (name != "hololivetv") {
            res.writeHead(403);
            res.end()
        } else {
            res.writeHead(200, { "content-type": "text/plain" });
            res.write("200 OK")
            sendImage(text)
            res.end();
        }
    });
});
timeline.listen(8083, '0.0.0.0');