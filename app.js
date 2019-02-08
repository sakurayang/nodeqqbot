const http = require("http");
const fs = require("fs");
const requestLib = require("request");
const app = http.createServer();
const ytdl = require('ytdl-core');

var address = "http://localhost:5700/send_group_msg?";
var debug = true;
var grep = /^@[\S\s]*/;

var groups = new Array();
groups["AIC"] = ["190674121", "118047250", "600132151"];
groups["LUNA"] = ["151751140", "118047250", "600132151", "739889796"];
groups["AKARI"] = ["614751169", "118047250", "600132151"];
groups["SIRO"] = ["118047250", "600132151"];
groups["AOI"] = ["634725864"];
groups["PPH"] = ["151751140", "118047250", "600132151", "739889796"];

function getUrl(msg, type) {
    var postdata = new Array();
    for (var i = 0, len = groups[type].length; i < len; i++) {
        postdata[i] = address + "group_id=" + groups[type][i] + "&message=" + encodeURIComponent(msg);
    }
    return postdata;
}

/*ytdl.getInfo(url, (err, info) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
        return;
    } else {
        let output = opts.output;
        let ext = (output || '').match(/(\.\w+)?$/)[1];

        if (output) {
            if (ext && !opts.quality && !opts.filterContainer) {
                opts.filterContainer = '^' + ext.slice(1) + '$';
                console.log(opts.filterContainer);
            }
        } else if (process.stdout.isTTY) {
            output = '{title}';
            console.log(output);
        }
    }
});


function downloadVideo(url) {
    if (ytdl.validateURL(url)) {
        ytdl(url, { filter: (format) => format.container === 'mp4' })
            .pipe(fs.createWriteStream('video.mp4'));
    }
}
*/
app.on('request', function(req, res) {
    var post = '';
    req.on('data', function(chunk) {
        post += chunk;
    });

    req.on('end', function() {
        var dataDec = post;
        console.log(dataDec);
        if (dataDec != (null | undefined | '')) {
            var content = JSON.parse(dataDec);
            var title = content.Title;
            var postby = content.postBy;
            var postat = content.postat;
            var url = content.url;
            var type = content.type;
            var text = content.text;
            var from = content.from;
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
                        var send_text =
                            postby + "|更新了：\n" +
                            "--------------------------------------------------\n" +
                            title +
                            "\n--------------------------------------------------\n" +
                            "视频地址：" + url +
                            "\n--------------------------------------------------\n" +
                            "更新于：" + postat +
                            "\n--------------------------------------------------"
                            /* +
                                                        "\n提示：可使用-f:zh:xxxxxxx来翻译"*/
                        ;
                        break;
                    case 'twitter':
                        var send_text =
                            postby + "|发推了：\n" +
                            "--------------------------------------------------\n" +
                            text +
                            "\n--------------------------------------------------\n" +
                            "地址：" + url +
                            "\n--------------------------------------------------\n" +
                            "发布于：" + postat +
                            "\n--------------------------------------------------"
                            /* +
                                                        "\n提示：可使用-f:zh:xxxxxxx来翻译"*/
                        ;
                        break;
                    default:
                        var send_text =
                            postby + "|更新了：\n" +
                            "--------------------------------------------------\n" +
                            title +
                            "\n--------------------------------------------------\n" +
                            "视频地址：" + url +
                            "\n--------------------------------------------------\n" +
                            "更新于：" + postat +
                            "\n--------------------------------------------------"
                            /* +
                                                        "\n提示：可使用-f:zh:xxxxxxx来翻译"*/
                        ;
                        break;
                }
                var urls = getUrl(send_text, type);
                console.log(send_text);
                for (var i = 0, len = urls.length; i < len; i++) {
                    try {
                        debug ? console.log(urls[i]) : requestLib(urls[i]);
                    } catch (error) {
                        console.error(error);
                    }

                }

                fs.writeFile('./data.log', "\n" + send_text + "\n", { flag: 'a+', encoding: 'utf-8', mode: '0666' }, function(err, fd) {
                    if (err) { return console.error(err); }
                });
                fs.writeFile('./data.log', post, { flag: 'a+', encoding: 'utf-8', mode: '0666' }, function(err, fd) {
                    if (err) { return console.error(err); }
                });
                res.write("200 OK");
                res.end();
            }
        } else {
            fs.writeFile('./data.log', "\nerror\n", { flag: 'a+', encoding: 'utf-8', mode: '0666' });
            res.writeHead(403, { 'Content-typr': 'text/html' });
            res.write("error");
            res.end()
        }

    });
});
app.listen(8080, '0.0.0.0');