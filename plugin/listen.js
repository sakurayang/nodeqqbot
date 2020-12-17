const http = require("http"),
    fs = require("fs"),
    mysql = require("node-mysql-promise"),
    translate = require("./translate.js"),
    config = require("../config.json");

const grep_command = /^(。|\.)[\Ss]*/;
var debug = config.debug;

var app = http.createServer();

app.on('request', function (req, res) {
    var data = '';
    req.on('data', function (chunk) {
        data = chunk.toString();
        data = JSON.parse(data);
    });

    req.on('end', function () {
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        var msg = data.message,
            sender = data.user_id,
            sender_name = data.user_id,
            type = data.post_type,
            group_id = data.group_id,
            role = data.sender.role,
            time = data.time;

        if (type == "message") {
            console.log(post);
            if (grep_command.test(msg)) {
                var sub = msg.split(/:|：/);
                var input = sub[0].substr(1);
                switch (input) {
                    case "f":
                        var lang = sub[1];
                        var text = sub[2];
                        let link = translate_url + "?lang=" + lang + "&word=" + encodeURIComponent(text);

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
                                }).then(() => {
                                    res.write('{"reply":"执行成功"}');
                                    res.end();
                                }).catch(err => {
                                    console.log(err);
                                    res.write('{"reply":"执行出错，请联系人偶管理员"}');
                                    res.end();
                                });
                            conn.query('update pause set last_pause_by=%s where group_id=%s', [sender_name, group_id]);
                        } else {
                            res.write('{"reply":"你没有权限"}');
                            res.end();
                        }
                        conn.end();
                        break;

                    case "run":
                        var conn = mysql.createConnection(db);
                        if (role == "owner" || role == "admin" || sender == 1304274443) {
                            conn
                                .table('pause')
                                .where({
                                    group_id = group_id
                                }).update({
                                    is_pause: false
                                }).then(() => {
                                    res.write('{"reply":"执行成功"}');
                                    res.end();
                                }).catch(err => {
                                    console.log(err);
                                    res.write('{"reply":"执行出错，请联系人偶管理员"}');
                                    res.end();
                                });
                        } else {
                            res.write('{"reply":"你没有权限"}');
                            res.end();
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
                                res.write(JSON.stringify(reply));
                                res.end();
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
                                    res.write(JSON.stringify(reply));
                                    res.end();
                                    break;
                                case "check":
                                    var id = sub[2];
                                    if (id == null || id == undefined) {
                                        res.write(JSON.stringify({
                                            "reply": "请正确书写命令格式"
                                        }));
                                        res.end();
                                    } else {
                                        plugin.work.check(id).then(result => {
                                            res.write(JSON.stringify({
                                                reply: result
                                            }));
                                        }).catch(err => {
                                            res.write(JSON.stringify({
                                                reply: err
                                            }));
                                        }).finally(() => {
                                            res.end()
                                        })
                                    }
                                    break;
                                case "take":
                                    var id = sub[2],
                                        work_type = works[sub[3]];

                                    break;
                                case "change":
                                    var conn = mysql.createConnection(db);
                                    var id = sub[2],
                                        work_type = works[sub[3]],
                                        user = sub[4];
                                    if ((sub.length < 5) || (id == undefined || id == null) || (work_type == undefined || work_type == null) || (user == undefined || user == null)) {
                                        res.write(JSON.stringify({
                                            "reply": "请正确书写命令格式"
                                        }));
                                        res.end()
                                    } else {
                                        send_result(work_type, String(user), id, res);
                                    }
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            res.write(JSON.stringify({
                                "reply": "你没有权限"
                            }));
                            res.end();
                        }
                        break;
                    default:
                        res.end();
                        break;
                }
            } else if (grep_at.test(msg)) {
                if (sender != 1304274443) {
                    var reply = '{"reply": "你们烦不烦啊，说了不要at了，走开行不行，我讨厌你。还有，只有主人才能碰我，你们走开。","ban":true,"ban_duration":1440}'
                } else {
                    var reply = '{ "reply": "主人我有好好工作的说~~" }'
                }
                res.write(reply);
                res.end();
            }
        } else if (type == "notice") {
            res.end();
        } else if (type == "request") {
            res.end();
        } else {
            res.end();
        }

        //console.log(raw_msg);
        //console.log(msg);
        //console.log(post);

    });
});
app.listen(18989, '0.0.0.0');