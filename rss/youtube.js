const request = require("request"),
    schedule = require('node-schedule'),
    mysql = require("mysql"),
    config = require("./config.json");
/**
 AIC "UC4YaOt1yT-ZeyB0OmxHgolA"
 AIG "UCbFwe3COkDrbNsbMyGNCsDg"
 */
var api_key = config.YTapiSK,
    channel = [ /*"UC4YaOt1yT-ZeyB0OmxHgolA",*/ "UCbFwe3COkDrbNsbMyGNCsDg"],
    debug = config.debug,
    db = debug ? config.testdb : config.db;

var work_rule = {
        dayOfWeek: 4,
        hour: 7,
        minute: 30,
    },
    update_check_rule = '*/5 * * * *';
// 每五分钟检查一次更新

var groups = [];
groups.work = ['190674121'];
var workers = {
    time: ["1304274443"],
    tran: ["1304274443"],
    corr: ["1304274443"]
}

function send(type, send_text) {
    if (groups[type]) {
        for (let i = 0, len = groups[type].length; i < len; i++) {
            try {
                debug ? console.log(send_text) :
                    request({
                        url: config.address,
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
    }
}


function insert(channel, id, title, url, postdate) {
    let conn = mysql.createConnection(db);
    conn.connect();
    conn.query('INSERT INTO work VALUES (0, ? , ? , ? , ? , ? , ? , ? , ? )', [channel,id,title,url,postdate,"not","not","not"]);
    conn.end();
    return 1;
}

function update(time, tran, corr, id) {
    let conn = mysql.createConnection(db);
    conn.connect();
    conn.query('UPDATE work SET time=?,tran=?,corr=? WHERE id=?', [time.toString(), tran.toString(), corr.toString(), id.toString()]);
    conn.end();
    return 1;
}

function checkUpdate() {
    channel.forEach(channel_id => {
        try {
            request({
                url: "https://www.googleapis.com/youtube/v3/activities?part=contentDetails%2Csnippet" +
                    "&channelId=" + channel_id +
                    "&maxResults=1" +
                    "&key=" + api_key,
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }, (error, res, body) => {
                //console.log(res+"\n----------------\n"+body);
                if (res.statusCode != 404 || res.statusCode != 403) {
                    let data = JSON.parse(body);
                    let id = data.items[0].contentDetails.upload.videoId,
                        title = he.encode(data.items[0].snippet.title,{'encodeEverything':true}),
                        postdate = (new Date(data.items[0].snippet.publishedAt)).valueOf(),
                        url = "https://www.youtube.com/watch?v=" + id,
                        channel = data.items[0].snippet.channelTitle;
                    console.log(id);
                    let conn = mysql.createConnection(db);
                    conn.connect();
                    conn.query('SELECT * FROM work WHERE id=? LIMIT 1',[id], (err, res,field) => {
                        //console.log(res);
                        (res==undefined||res=='')
                        //? conn.query('INSERT INTO work VALUES (0, ? , ? , ? , ? , ? , ? , ? , ? )', [channel,id,title,url,postdate,"not","not","not"])
                        ? insert(channel, id, title, url, postdate)
                        : false;
                    });
                    conn.end();
                }
            });
        } catch (error) {
            console.error(error);
        }
    });
}


function workGive() {
    try {
        let conn = mysql.createConnection(db);
        conn.connect();
        conn.query('SELECT * FROM work WHERE (time="not" OR tran="not") OR corr="not"', (err, res) => {
            console.log(res);
            res.forEach((val) => {
                let channel = val.channel,
                    id = val.id,
                    title = he.decode(val.title),
                    url = val.url,
                    postdate = (new Date(Number(val.postdate))).toLocaleString("zh-Hans-CN", {
                        hour12: false,
                        timeZone: "Asia/Shanghai"
                    }),
                    time = (val.time == "not") ? workers.time[Math.ceil(Math.random() * workers.time.length) - 1] : val.time,
                    tran = (val.time == "not") ? workers.tran[Math.ceil(Math.random() * workers.tran.length) - 1] : val.time,
                    corr = (val.time == "not") ? workers.corr[Math.ceil(Math.random() * workers.corr.length) - 1] : val.time;
                update(time, tran, corr, id);
                send('work', `工作(ID：${id})已分配
标题：${title}
频道：${channel}
地址：${url}
发布日期：${postdate}
时轴；[CQ:at,qq=${time}]
翻译：[CQ:at,qq=${tran}]
校对：[CQ:at,qq=${corr}]`);
            });
        });
        conn.end();
    } catch (error) {
        console.error(error);
    }
}

schedule.scheduleJob(update_check, update_check_rule, () => {
    checkUpdate();
});

schedule.scheduleJob(work_give, work_rule, () => {
    workGive();
});