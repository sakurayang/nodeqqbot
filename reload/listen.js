VERSION = "0.3.1-beta";
const http = require("http"),
    he = require("he"),
    fs = require("fs"),
    requestLib = require("request"),
    mysql = require("node-mysql-promise"),
    crypto = require('crypto'),
    unflatten = require("flat").unflatten,
    config = require("./config.json");
// const AipContentCensorClient = require("baidu-aip-sdk").contentCensor;
// const HttpClient = require("baidu-aip-sdk").HttpClient;
// const Step = require("step");

var grep_image = /[\S\s]*\[CQ:image[\S\s]*.\]/,
    grep_command = /^(。|\.)[\Ss]*/,
    grep_at = /[\S\s]*\[CQ:at,qq=2782255175\][\S\s]*/,
    app = http.createServer(),
    translate_url = config.translate,
    db = config.db,
    date = new Date(),
    year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate();

var works = [];
works["时轴"] = "time";
works["翻译"] = "tran";
works["校对"] = "corr";

var channal = [
    '',
    'Youtube',
    'OpenRec',
    'ShowRoom',
    'Mirrativ',
    'Colon-Live',
    'Bilibili',
    '17.live'
];

// function getVideoAddress(type, ch_id, a) {
//     var l = null;
//     switch (type) {
//         case 1:
//             l = 'https://www.youtube.com/watch?v=' + ch_id;
//             break;
//         case 2:
//             l = 'https://www.openrec.tv/live/' + ch_id;
//             break;
//         case 3:
//             l = 'https://www.showroom-live.com/' + a.substr(3);
//             break;
//         case 4:
//             l = 'https://www.mirrativ.com/live/' + ch_id;
//             break;
//         case 5:
//             l = 'https://colon-live.com/Shows/Live/' + (ch_id.slice(0, 8) + '-' + ch_id.slice(8, 12) + '-' + ch_id.slice(12, 16) + '-' + ch_id.slice(16, 20) + '-' + ch_id.slice(20));
//             break;
//         case 6:
//             l = "请等待开播";
//             //l = 'https://live.bilibili.com/' + a.substr(3);
//             break;
//         case 7:
//             l = 'https://17.live/live/' + a.substr(3)
//             break;
//     }
//     return l;
// }

// function getChannelAddress(type, ch_id) {
//     var n = null;
//     switch (type) {
//         case 1:
//             n = 'https://www.youtube.com/channel/' + ch_id;
//             break;
//         case 2:
//             n = 'https://www.openrec.tv/user/' + ch_id.substr(3);
//             break;
//         case 3:
//             n = null
//                 //n = 'https://www.showroom-live.com/room/profile?room_id=' + JSON.parse(a).room_id;
//             break;
//         case 4:
//             n = 'https://www.mirrativ.com/user/' + ch_id.substr(3);
//             break;
//         case 5:
//             n = 'https://colon-live.com/Usr/VTuberProfile?vTuberUserId=' + (ch_id.slice(0, 8) + '-' + ch_id.slice(8, 12) + '-' + ch_id.slice(12, 16) + '-' + ch_id.slice(16, 20) + '-' + ch_id.slice(20));
//             break;
//         case 6:
//             n = 'https://space.bilibili.com/' + ch_id.substr(3);
//             break;
//         case 7:
//             n = 'https://17.live/profile/r/' + ch_id.substr(3)
//     }
//     return n;
// }
app.on('request', function (req, rest) {
    var data = '';
    req.on('data', function (chunk) {
        data += chunk;
        post = JSON.parse(data);
    });

    req.on('end', function () {
        rest.writeHead(200, {
            'Content-Type': 'application/json'
        });

        var msg = post.message,
            sender = post.user_id,
            sender_name = post.user_id,
            type = post.post_type,
            group_id = post.group_id,
            message_id = post.message_id,
            role = post.sender.role,
            time = post.time;

        function encrypto(data) {
            let cipher = crypto.createCipher('aes256', config.aes265Key);
            let encrypto_messgae = cipher.update(data, 'utf8', 'hex');
            encrypto_messgae += cipher.final('hex').toString();
            return encrypto_messgae;
        }
        var encrypto_message = encrypto(msg);
        //console.log(type);
        var conn = mysql.createConnection(db);
        conn
            .table('message')
            .add({
                message_id: Number(message_id),
                recode_id: 0,
                group_id: String(group_id),
                message_content: encrypto_message,
                sender_id: sender,
                send_time: time
            }).catch(error => {
                console.log(err);
            });
        if (type == "message") {
            //console.log(post);
            console.log(post);
            if (grep_command.test(msg)) {
                var sub = msg.split(/:|：/);
                var input = sub[0].substr(1);
                //var return_text = getRuturnText(input);
                //var sender = post.sender.card;
                //console.log(sender+": "+msg+"\n");
                //console.log(input);
                //console.log(return_text);

                switch (input) {

                    case "f":
                        var lang = sub[1];
                        var text = sub[2];
                        let link = translate_url + "?lang=" + lang + "&word=" + encodeURIComponent(text);
                        //var translation = new Array()
                        /*Step(
                            function getResult() {*/
                        requestLib(link, (err, res) => {
                            if (err) {
                                console.log(err);
                            }
                            var result = JSON.parse(res.body)
                            var translation = result["trans_result"][0]["dst"];

                            var reply = {
                                "reply": "人家帮你翻译好啦~：\n---------\n" + translation + "\n---------\n翻译结果来自百度翻译"
                            };
                            console.log(reply);

                            rest.write(JSON.stringify(reply));
                            rest.end();

                        });
                        break;

                    case "pause":
                        var conn = mysql.createConnection(db);
                        if (role == "owner" || role == "admin" || sender == 1304274443) {
                            conn
                                .table('pause')
                                .where({
                                    group_idLgroup_id
                                }).update({
                                    is_pause: true
                                }).then(affectRow => {
                                    rest.write('{"reply":"执行成功"}');
                                    rest.end();
                                }).catch(err => {
                                    console.log(err);
                                    rest.write('{"reply":"执行出错，请联系人偶管理员"}');
                                    rest.end();
                                });
                            conn.query('update pause set last_pause_by=%s where group_id=%s', [sender_name, group_id]);
                        } else {
                            rest.write('{"reply":"你没有权限"}');
                            rest.end();
                        }
                        conn.end();
                        break;

                    case "run":
                        var conn = mysql.createConnection(db);
                        if (role == "owner" || role == "admin" || sender == 1304274443) {
                            conn
                                .table('pause')
                                .where({
                                    group_id=group_id
                                }).update({
                                    is_pause: false
                                }).then(affectRow => {
                                    rest.write('{"reply":"执行成功"}');
                                    rest.end();
                                }).catch(err => {
                                    console.log(err);
                                    rest.write('{"reply":"执行出错，请联系人偶管理员"}');
                                    rest.end();
                                });
                        } else {
                            rest.write('{"reply":"你没有权限"}');
                            rest.end();
                        }
                        conn.end();
                        break;

                    case "live":
                        var raw = '';
                        var time = sub[1],
                            num = sub[2];
                        if (time && num) {
                            fs.readFile(`./${year}${month}${day}.json`, (err, data) => {
                                if (err) {
                                    console.log(err)
                                }
                                raw = unflatten(JSON.parse(data.toString()));
                                //console.log(raw);
                                let info = raw[time][num - 1],
                                    ch_id = info.ch_id,
                                    ch_type = info.ch_type,
                                    start_time_hour = String(new Date(info.scheduled_start_time).getHours()).padStart(2, 0),
                                    start_time_minute = String(new Date(info.scheduled_start_time).getMinutes()).padStart(2, 0),
                                    start_time = `${start_time_hour}:${start_time_minute}`,
                                    streamer_id = info.streamer_id,
                                    name = info.streamer_name,
                                    title = info.title,
                                    video_id = info.video_id;
                                let video_address = (1 == ch_type) ? "https://www.youtube.com/watch?v=" + video_id : "目前尚未支持获取直播信息",
                                    channel_address = (1 == ch_type) ? "https://www.youtube.com/channel/" + ch_id : "目前尚未支持获取直播信息";
                                let text =
                                    `呀嚯~这里是你要查的资料哟~\n----------\n名字：${name}\n----------\n频道：${channel_address}\n----------\n直播间：${video_address}\n----------\n标题：${title}\n----------\n预定开始时间：${start_time}`;
                                let reply = {
                                    "reply": text
                                };
                                rest.write(JSON.stringify(reply));
                                rest.end();
                            });
                        } else {
                            null
                        }
                        break;

                    case "w":
                        if (group_id == "190674121") {
                            var secondery_input = sub[1];
                            switch (secondery_input) {
                                case "help":
                                    var reply = {
                                        "reply": "\nWork bot Version--" + VERSION +
                                            "\n--------" +
                                            "\n.w:help ---查看帮助" +
                                            "\n.w:check:<视频id>   --查询某视频信息" +
                                            "\n.w:take:<视频id>:<时轴|翻译|校对>   --手动(为你自己)接取任务" +
                                            "\n.w:change:<视频id>:<时轴|翻译|校对>:<QQ号>  --手动指定任务人" +
                                            "\n--------" +
                                            "\n提示：中英文符号皆可"
                                    };
                                    rest.write(JSON.stringify(reply));
                                    rest.end();
                                    break;
                                case "check":
                                    var id = sub[2];
                                    var conn = mysql.createConnection(db);
                                    if (id == null || id == undefined) {
                                        rest.write(JSON.stringify({
                                            "reply": "请正确书写命令格式"
                                        }));
                                        rest.end();
                                    } else {
                                        conn
                                            .table('work')
                                            .where({
                                                id: id
                                            }).limit(1)
                                            .select()
                                            .then(data => {
                                                //console.log(data);
                                                if (data == '' || data == undefined) {
                                                    rest.write(JSON.stringify({
                                                        "reply": "暂无数据"
                                                    }));
                                                    rest.end();
                                                } else {
                                                    var reply = "\n你查询的id是" + data[0].id +
                                                        "\n标题：" + he.decode(data[0].title) +
                                                        "\n地址：" + data[0].url +
                                                        "\n发布日期：" + (new Date(Number(data[0].postdate))).toLocaleString("zh-Hans-CN", {
                                                            hour12: false,
                                                            timeZone: "Asia/Shanghai"
                                                        }) +
                                                        "\n时轴：" + ((data[0].time == "not") ? "暂无" : "[CQ:at,qq=" + data[0].time + "]") +
                                                        "\n校对：" + ((data[0].tran == "not") ? "暂无" : "[CQ:at,qq=" + data[0].tran + "]") +
                                                        "\n翻译：" + ((data[0].corr == "not") ? "暂无" : "[CQ:at,qq=" + data[0].corr + "]")
                                                    rest.write(JSON.stringify({
                                                        "reply": reply
                                                    }));
                                                    rest.end();
                                                }
                                            }).catch(error => {
                                                console.log(error);
                                                rest.write(JSON.stringify({
                                                    "reply": "[CQ:at,qq=1304274443]起床修BUG啦啦啦啦啦啦啦啦",
                                                    "at_sender": false
                                                }));
                                                rest.end();
                                            });
                                    }
                                    break;
                                case "take":
                                    var id = sub[2],
                                        work_type = works[sub[3]];
                                    var conn = mysql.createConnection(db);
                                    if ((sub.length < 4) || (id == undefined || id == null) || (work_type == undefined || work_type == null)) {
                                        rest.write(JSON.stringify({
                                            "reply": "请正确书写命令格式"
                                        }));
                                        rest.end();
                                    } else {
                                        conn
                                            .table('work')
                                            .where({
                                                id: id
                                            }).select()
                                            .then(data => {
                                                if (data[work_type] != "not") {
                                                    rest.write(JSON.stringify({
                                                        "reply": `接取失败，该任务已分配（或被接取），任务人：${data[work_type]}`
                                                    }));
                                                    rest.end();
                                                } else {
                                                    send_result(work_type, String(sender), id, rest);
                                                }
                                            });
                                    }
                                    break;
                                case "change":
                                    var conn = mysql.createConnection(db);
                                    var id = sub[2],
                                        work_type = works[sub[3]],
                                        user = sub[4];
                                    if ((sub.length < 5) || (id == undefined || id == null) || (work_type == undefined || work_type == null) || (user == undefined || user == null)) {
                                        rest.write(JSON.stringify({
                                            "reply": "请正确书写命令格式"
                                        }));
                                        rest.end()
                                    } else {
                                        send_result(work_type, String(user), id, rest);
                                    }
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            rest.write(JSON.stringify({
                                "reply": "你没有权限"
                            }));
                            rest.end();
                        }
                        break;
                    default:
                        rest.end();
                        break;
                }
            } else if (grep_at.test(msg)) {
                if (sender != 1304274443) {
                    var reply = '{"reply": "你们烦不烦啊，说了不要at了，走开行不行，我讨厌你。还有，只有主人才能碰我，你们走开。","ban":true,"ban_duration":1440}'
                } else {
                    var reply = '{ "reply": "主人我有好好工作的说~~" }'
                }
                rest.write(reply);
                rest.end();
            }
        } else if (type == "notice") {
            rest.end();
        } else if (type == "request") {
            rest.end();
        } else {
            rest.end();
        }

        //console.log(raw_msg);
        //console.log(msg);
        //console.log(post);

    });
});
app.listen(18989, '0.0.0.0');

function send_result(work_type, sender, id, rest) {
    let conn = mysql.createConnection(db);
    let data = {};
    data[work_type] = sender;
    conn.table('work')
        .where({
            id: id
        })
        .update(data)
        .catch(err => {
            console.log(err);
            rest.write(JSON.stringify({
                "reply": "因内部错误失败，[CQ:at,qq=1304274443]起床修BUG啦啦啦啦啦啦",
                "at_sender": false
            }));
        }).then(() => {
            rest.write(JSON.stringify({
                "reply": "成功"
            }));
            rest.end();
        });
}