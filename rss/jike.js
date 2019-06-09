const request = require('request'),
    randomUA = require('random-fake-useragent'),
    schedule = require('node-schedule'),
    fs = require('fs'),
    route_config = require('./route.json'),
    route = require('./route.js'),
    send = require('../plugin/send');

var rule = route_config.jike[0].schedule;
//每十分钟一次



function check() {
    let options = new route.Jike(route_config.jike[0].id, 'topic');
    request(options.url, options.uri, )
}






schedule.scheduleJob('check', rule, () => {
    let options = {
        "credentials": "omit",
        "headers": {
            "User-Agent": randomUA.getRandom(),
            "Accept": "application/json",
            "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
            "App-Version": "5.3.0",
            "Content-Type": "application/json",
            "platform": "web",
            "x-jike-access-token": ""
        },
        "referrer": "https://web.okjike.com/topic/564ab85208987312006e13ab/official",
        "body": "{\"loadMoreKey\":null,\"topic\":\"564ab85208987312006e13ab\",\"limit\":1}",
        "method": "POST",
        "mode": "cors"
    };
    request('https://app.jike.ruguoapp.com/1.0/messages/history', options, (err, res) => {
        if (err || res.statusCode != 200) console.error(new Error(err));
        let data = res.body.data[0],
            id = data.id,
            content = data.content,
            picture = data.pictures[0].picUrl,
            time = (new Date(data.createdAt)).toLocaleString;

        fs.stat(`./${id}`, err => {
            if (err) {
                fs.writeFile(`./${id}`, '', err => {
                    if (err) throw err
                });
                let text = `Breaking News 重大的突发新闻\n--------\n发布于: ${time}\n--------\n${content}\n--------\n地址: https://web.okjike.com/topic/564ab85208987312006e13ab/official`;
                send.private('1304274443', text);
            } else {
                true;
            }
        })
    })
})