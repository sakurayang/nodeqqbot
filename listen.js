const http = require("http");
const requestLib = require("request");
const Step = require("step");
const mysql = require("mysql");
const AipContentCensorClient = require("baidu-aip-sdk").contentCensor;
const HttpClient = require("baidu-aip-sdk").HttpClient;
const crypto = require('crypto');


var APP_ID = "15671324";
var API_KEY = "E9BdOcqOUb12RsSK1AGlXeHZ";
var SECRET_KEY = "Q3pipi5bU129bvmPan1LSaH4f8pn4bbu";



var client = new AipContentCensorClient(APP_ID, API_KEY, SECRET_KEY);
var grep_image = /[\S\s]*\[CQ:image[\S\s]*.\]/;
var grep_command = /^![\Ss]*/;
var grep_at = /[\S\s]*\[CQ:at,qq=2782255175\][\S\s]*/;
var app = http.createServer();
var translate_url = "http://server.bkwhentai.tw/bdtr.php";
var db = {
    host: 'localhost',
    user: 'root',
    password: '12shf1',
    database: 'qqbot'
};


app.on('request', function(req, rest) {
    var data = '';
    req.on('data', function(chunk) {
        data += chunk;
        post = JSON.parse(data);
    });

    req.on('end', function() {
        rest.writeHead(200, { 'Content-Type': 'application/json' });

        var msg = post.message;
        var sender = post.user_id;
        var role = post.sender.role;
        var sender_name = post.user_id;
        var type = post.post_type;
        var group_id = post.group_id;
        var message_id = post.message_id;
        var time = post.time;

        function encrypto(data) {
            let cipher = crypto.createCipher('aes256', '12shf1');
            let encrypto_messgae = cipher.update(data, 'utf8', 'hex');
            encrypto_messgae += cipher.final('hex').toString();
            return encrypto_messgae;
        }
        var encrypto_message = encrypto(msg);
        //console.log(type);
        var conn = mysql.createConnection(db);
        conn.connect();
        try {
            conn.query(`insert into message values(${Number(message_id)},0,"${group_id.toString()}","${encrypto_message}","${sender}","${time}");`);
        } catch (error) {
            console.log(error);
        } finally {
            conn.end();
        }
        if (type == "message") {
            //console.log(post);
            console.log(post);
            if (grep_command.test(msg)) {
                var sub = msg.split(":");
                var command = sub[0].substr(1);
                //var return_text = getRuturnText(command);
                //var sender = post.sender.card;
                //console.log(sender+": "+msg+"\n");
                //console.log(command);
                //console.log(return_text);

                switch (command) {
                    case "f":
                        var lang = sub[1];
                        var text = sub[2];
                        var link = translate_url + "?lang=" + lang + "&word=" + encodeURIComponent(text);
                        //var translation = new Array()
                        /*Step(
                            function getResult() {*/
                        requestLib(link, (err, res) => {
                            if (err) {
                                console.log(err);
                            }
                            var result = JSON.parse(res.body)
                            var translation = result["trans_result"][0]["dst"];

                            var reply = { "reply": "人家帮你翻译好啦~：\n---------\n" + translation + "\n---------\n翻译结果来自百度翻译" };
                            console.log(reply);

                            rest.write(JSON.stringify(reply));
                            rest.end();

                        });
                        break;
                    case "pause":
                        var conn = mysql.createConnection(db);
                        conn.connect();
                        if (role == "owner" || role == "admin" || sender == 1304274443) {
                            conn.query('update pause set is_pause=true where group_id="' + group_id + '"', (err) => {
                                if (err) {
                                    rest.write('{"reply":"执行出错，请联系人偶管理员"}');
                                    rest.end();
                                    return console.log(err);
                                } else {
                                    rest.write('{"reply":"执行成功"}');
                                    rest.end();
                                }
                            });
                            conn.query('update pause set last_pause_by=' + sender_name + ' where group_id="' + group_id + '"');
                        } else {
                            rest.write('{"reply":"Permission Defined!\nYou is not admin or owner"}');
                            rest.end();
                        }
                        conn.end();
                        break;
                    case "run":
                        var conn = mysql.createConnection(db);
                        conn.connect();
                        if (role == "owner" || role == "admin" || sender == 1304274443) {
                            conn.query('update pause set is_pause=false where group_id="' + group_id + '"', (err) => {
                                if (err) {
                                    rest.write('{"reply":"执行出错，请联系人偶管理员"}');
                                    rest.end();
                                    return console.log(err);
                                } else {
                                    rest.write('{"reply":"执行成功"}');
                                    rest.end();
                                }
                            });
                            conn.query('update pause set last_pause_by=' + sender_name + ' where group_id="' + group_id + '"');
                        } else {
                            rest.write('{"reply":"Permission Defined!\nYou is not admin or owner"}');
                            rest.end();
                        }
                        conn.end()
                        break;
                    default:
                        var reply = "命令格式错误";
                        break;
                }


            } else if (grep_at.test(msg)) {
                if (sender != 1304274443) {
                    var reply = '{"reply": "你们烦不烦啊，说了不要at了，走开行不行，我讨厌你。还有，只有主人才能碰我，你们走开。","ban":true,"ban_duration":1440}'
                } else { var reply = '{ "reply": "主人我有好好工作的说~~" }' }
                rest.write(reply);
                rest.end();
            }
        } else if (type == "notice") {
            rest.end();
        } else if (type == "request") {
            rest.end();
        } else { rest.end(); }

        //console.log(raw_msg);
        //console.log(msg);
        //console.log(post);

    });
});
app.listen(18989, '0.0.0.0');

/* else if (grep_image.test(msg)) {
                var grep_url = /[a-zA-z]+:\/\/[^\s]*.\&/i;
                var url = grep_url.exec(msg)[0];
                try {
                    client.imageCensorUserDefined(url, 'url').then(data => {
                        if (data.error_code) {
                            console.log(data.error_msg)
                            rest.end();
                        } else if (data.conclusion == "合规") {
                            rest.end();
                        } else {
                            console.log(data);
                            var ban_type = ["", "色情", "性感", "暴恐", "恶心", "", "", "", "政治人物", "敏感词"];
                            var ban_msg = data.data[0].msg;
                            console.log(ban_msg);
                            var reply = { "reply": "你违规了\n违规类型：" + ban_type[data.data[0].type] + "\n违规内容：" + ban_msg + "\n请注意" };
                            console.log(reply);
                            rest.write(JSON.stringify(reply));
                            rest.end();
                        }
                    }, error => {
                        console.log(error)
                        rest.end();
                    });
                } catch (error) {
                    console.log(error);
                    rest.end();
                }

            }*/