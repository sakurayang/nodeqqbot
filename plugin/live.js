const request = require('request');
const schedule = require('node-schedule');
const fs = require('fs');
const jsonfile = require('jsonfile');

const cloudinary = require("cloudinary").v2;
const emoji = require('node-emoji');
const { registerFont, createCanvas } = require('canvas');
const flatten = require("flat");

const config = require('../config.json');
const send = require('./send.js');
const api_adress = 'https://hiyoko.sonoj.net/f/avtapi/schedule/fetch_curr';

var groups = ["118047250", "739889796", "591845717"];
//groups = ["118047250"];
var colors = config.colors;
const cloudinary_config = config.cloudinary;

process.env.CLOUDINARY_URL = cloudinary.env;
cloudinary.config(cloudinary_config.config);

weekdays = ['日', '一', '二', '三', '四', '五', '六', '日'];
jpweekdays = ['日', '月', '火', '水', '木', '金', '土', '日'];
locale = ['', 'YouTube', 'OpenRec', 'ShowRoom', 'Mirrativ', 'Colon-Live', 'Bilibili', '17.live'];

registerFont("./fonts/NotoSansCJKjp-Regular.otf", { "family": "NotoSans" });
registerFont("./fonts/NotoSansCJKsc-Regular.otf", { "family": "NotoSans" });

var dailyReport = new schedule.RecurrenceRule();
dailyReport.hour = [0, 6, 12, 18];
dailyReport.minute = 5;
dailyReport.second = 5;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
    //不含最大值，含最小值
}

function drawText(ctx, t, x, y, w) {
    var chr = t.split("");
    var temp = "";
    var row = [];
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textBaseline = "middle";
    for (var a = 0; a < chr.length; a++) {
        if (ctx.measureText(temp).width < w) { ; } else {
            row.push(temp);
            temp = "";
        }
        temp += chr[a];
    }
    row.push(temp);
    for (var b = 0; b < row.length; b++) { ctx.fillText(row[b], x, y + (b + 1) * 20); }
}

function drawBackgroundText(ctx, canvas_width, canvas_height, year, month, day, week) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas_width, canvas_height);

    //旁注
    ctx.font = '15px "NotoSans"';
    ctx.textAlign = 'end';
    ctx.textBaseline = 'top';

    ctx.fillStyle = '#272727';
    ctx.fillText("Power By node-canvas, program by Gerard V0.1-beta", canvas_width - 5, 0);
    ctx.fillText("各位DD们~今天的主题色让你想到了哪位vtb呢", canvas_width - 5, 15);
    ctx.fillStyle = 'red';
    ctx.textAlign = 'start';
    ctx.fillText('可以用"!live:<时间>:<序号>"来查询详细信息，英文符号哟', 5, canvas_height - 35);
    ctx.fillText('例如21点的第二个：!live:21:2', 5, canvas_height - 20);

    //标题
    ctx.font = '100px "NotoSans"';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    ctx.fillText("DDLive日刊", canvas_width / 2, 120);
    /*     //画标题分隔线
        ctx.fillStyle = "black";
        ctx.fillRect(10, 125, canvas_width - 10, 2);
     */

    //日期
    ctx.font = '10px "NotoSans"';
    ctx.textAlign = 'end';
    ctx.textBaseline = "bottom"
    ctx.fillStyle = '#272727';
    ctx.fillText(`${year}年${month}月${day}日 星期${weekdays[week]} ${jpweekdays[week]}曜日`, canvas_width, canvas_height);
}

function drawTimeBackground(ctx, line, color, canvas_width, position_line_in_y, index) {
    //Line 1 [Deep  color]
    //Line 2 [Light color]
    //Line 3 [Deep  color]
    //80 for alpha: #ffffff ==> #ffffff80
    ctx.fillStyle = ((line + 1) % 2) == 0 ? color : color + "80";
    //ctx.fillRect(x,y,w,h)
    ctx.fillRect(0, position_line_in_y, canvas_width, 180);
    //write the time
    ctx.fillStyle = "black";
    ctx.fillText(String(index).padStart(2, 0) + ":00", 100, position_line_in_y + 90);
}

function WriteDetilText(data, ctx, position_row_x, position_line_in_y) {
    let type = data.ch_type, start_time_hour = String((new Date(data.scheduled_start_time)).getHours()).padStart(2, 0), start_time_minute = String((new Date(data.scheduled_start_time)).getMinutes()).padStart(2, 0), name = data.streamer_name, title = emoji.replace(data.title, emoji => '').replace(/\ufffd/ig, '');
    //写字
    ctx.font = '15px "NotoSans"';
    ctx.fillStyle = "black";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "end";
    ctx.fillText(name, position_row_x + 310, position_line_in_y + 40);
    ctx.fillText(`@${locale[type]} ${start_time_hour + ":" + start_time_minute}`, position_row_x + 310, position_line_in_y + 25);
    ctx.textAlign = "start";
    ctx.font = '20px "NotoSans"';
    drawText(ctx, title, position_row_x + 2, position_line_in_y + 90, 300);
    //竖向分割线
    ctx.fillStyle = "white";
    ctx.fillRect(position_row_x, position_line_in_y, 2, 182);
    ctx.fillRect(position_row_x + 320, position_line_in_y, 2, 182);
}

async function getInfo(year, month, day) {
    let options = {
        url: api_adress,
        method: "POST",
        json: true,
        body: {
            "start": `${year}-${month}-${String(day).padStart(2, 0)} 00:00:00`,
            "end": `${year}-${month}-${String(Number(day) + 1).padStart(2, 0)} 00:00:00`
        }
    }
    return new Promise(resolve => {
        request(options, (err, res) => {
            if (err || res.statusCode == 404) return Promise.reject(err);
            //liveSchedule is an Array
            let live_schedule = res.body.schedules;
            resolve(live_schedule);
        });
    });
}

function parseInfo(data) {
    let timeLine = [];
    let count = [];
    data.forEach((element) => {
        //get hour from UNIX time
        let hour = Number((new Date(element.scheduled_start_time)).getHours());
        //count how much vtuber are living in this hour
        //if Array:TimeLine has the key the same as the hour, 
        //push the vtuber live info in it and the value of 
        //Array:count which has the same key plus 1
        //else, create the key has value:1
        if (timeLine[hour]) {
            timeLine[hour].push(element);
            count[hour]++;
        } else {
            timeLine[hour] = [element];
            count[hour] = 1;
        }
    });

    //flat the array
    //count: [,,,2,3,4,,5,] ==> [2,3,4,5]
    count = (() => {
        let count_flat = [];
        count.forEach(value => {
            value ? count_flat.push(value) : false;
        });
        return count_flat;
    })();
    return [count, timeLine];
}

function go() {
    let date = new Date(),
        year = date.getFullYear(),
        month = String(date.getMonth() + 1).padStart(2, 0),
        day = date.getDate(),
        week = date.getDay();

    getInfo(year, month, day).then((result) => {
        console.log(result);
        let all = parseInfo(result);
        let count = all[0];
        let timeLine = all[1];

        //write the info into JSON file
        fs.writeFile(`./${year}${month}${String(day).padStart(2, 0)}.json`,
            `${JSON.stringify(flatten(timeLine))}`, (err) => { return new Error(err) });


        //get the width of canvas, 
        //320px per grid, 2px for grid line, 175px for time
        let canvas_width = Math.max(...count) * (320 + 2) + 175;

        //get the height of canvas,180 per grid, 200px for title
        let canvas_height = count.length * 180 + 200;

        let canvas = new createCanvas(canvas_width, canvas_height);
        let ctx = canvas.getContext('2d');

        let color = `#${colors[getRandomInt(0, colors.length)]}`;
        //draw the background
        drawBackgroundText(ctx, canvas_width, canvas_height, year, month, day, week);

        let line = 0;
        //draw the text and background
        timeLine.forEach((value, index) => {
            ctx.font = '50px "NotoSans"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            //get the line position, 127px for time 
            //and 180 for pre grid, 2 for per line
            let position_line_in_y = 127 + (180 + 2) * line;

            //if have value
            if (value) {
                //画时间分段背景
                drawTimeBackground(ctx, line, color, canvas_width, position_line_in_y, index);
                //counter
                let row = 0;
                value.forEach(data => {
                    let position_row_x = 192 + 320 * row;
                    WriteDetilText(data, ctx, position_row_x, position_line_in_y);
                    row = row + 1;
                });
                //计数器+1
                line = line + 1;
            } else {
                line = line;
            }
        });
        let filename = `${year}${month}${String(day).padStart(2, 0)}.png`;
        canvas.createPNGStream().pipe(
            fs.createWriteStream(
                `../qqbot/daily/${filename}`, { autoClose: 1 })
                .on("finish", () => {
                    console.log('The PNG file was created.');
                    cloudinary.uploader.upload(`./tmp/${filename}`,
                        {
                            use_filename: true,
                            overwrite: true,
                            folder: "DDaily/"
                        }, (err, res) => {
                            if (err) throw err;
                            delete require.cache[`${process.env.PWD}/tmp/img_his.json`];
                            let img_his = require("./tmp/img_his.json")
                            jsonfile.writeFile("./tmp/img_his.json",
                                { ...img_his, [filename]: res.url }, { flag: "a" })
                                .catch(err => { throw err })
                        }
                    )
                })
        );
    }).catch((err) => {
        throw err;
    });
}

schedule.scheduleJob({ hour: 0, minute: 2 }, () => {
    go()
});
//go()

schedule.scheduleJob(dailyReport, () => {
    delete require.cache[`${process.env.PWD}/tmp/img_his.json`];
    let img_his = require('./tmp/img_his.json');
    let date = new Date(),
        year = date.getFullYear(),
        month = String(date.getMonth() + 1).padStart(2, 0),
        day = String(date.getDate()).padStart(2, 0);
    let filename = `${year}${month}${day}`;
    send.group(groups, `[CQ:image,file=file:///Z:\\home\\user\\coolq\\daily\\${[filename]}]`);
    send.group(groups,`图片若看不清或看不见请戳\n${img_his[filename]}`)
});

