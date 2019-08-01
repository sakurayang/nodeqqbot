const http = require('http'),
    mysql = require('node-mysql-promise'),
    config = require('../config.json'),
    send = require('./send');

var bot_address = config.bot.address,
    debug = config.debug,
    group = config.bot.group;

const app = http.createServer();
decodeURIComponent
async function checkUpdate() {
    await channel.forEach(channel_id => {
        await request({
            method: 'GET',
            url: "https://www.googleapis.com/youtube/v3/activities",
            qs: {
                part: "contentDetails,snippet",
                channelId: channel_id,
                maxResults: 1,
                key: api_key
            },
            headers: {
                'Accept': 'application/json'
            }
        }, (error, res, body) => {
            //console.log(res+"\n----------------\n"+body);
            if (err) throw Promise.reject(new Error(err));
            if (res.statusCode != 404 || res.statusCode != 403) {
                let data = JSON.parse(body);
                let id = data.items[0].contentDetails.upload.videoId,
                    title = he.encode(data.items[0].snippet.title, {
                        'encodeEverything': true
                    }),
                    postdate = (new Date(data.items[0].snippet.publishedAt)).valueOf(),
                    url = "https://www.youtube.com/watch?v=" + id,
                    channel = data.items[0].snippet.channelTitle;
                console.log(id);
                let conn = mysql.createConnection(db);
                conn.connect();
                conn.query('SELECT * FROM work WHERE id=? LIMIT 1', [id], (err, res, field) => {
                    //console.log(res);
                    (res == undefined || res == '')
                    //? conn.query('INSERT INTO work VALUES (0, ? , ? , ? , ? , ? , ? , ? , ? )', [channel,id,title,url,postdate,"not","not","not"])
                    ?
                    insert(channel, id, title, url, postdate): false;
                });
                conn.end();
            }
        });
    });
}