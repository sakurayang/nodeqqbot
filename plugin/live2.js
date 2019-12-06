const request = require("request-promise-native");
const flatten = require("flat");
const fs = require("fs");
const {
    registerFont,
    createCanvas
} = require('canvas');
const schedule = require("node-schedule");


const ADDRESS = "https://hiyoko.sonoj.net/f/avtapi/schedule/fetch_curr";
const config = require('../config.json');
const COLORS = config.colors;

const ch_type = [
    "",
    "Youtube",
    "OpenREC",
    "ShowRoom",
    "Mirrativ",
    "Colon",
    "Bilibili",
    "17Live",
    "twitch"
];

a = {
    "ch_id": "UCPQRl6ceaNBTeuHkMqsfl7Q",
    "ch_type": 1,
    "scheduled_start_time": 1575064800000,
    "streamer_name": "尸解ユヱ",
    "thumbnail_url": "https://i.ytimg.com/vi/mL77HrcsR6A/mqdefault_live.jpg",
    "title": "起きて人類、おはよう配信.しかいゆえ【vrtuber】",
    "video_id": "mL77HrcsR6A",
}

registerFont("./fonts/NotoSansCJKjp-Regular.otf", {
    "family": "NotoSans"
});
registerFont("./fonts/NotoSansCJKsc-Regular.otf", {
    "family": "NotoSans"
});

var dailyReport = new schedule.RecurrenceRule();
dailyReport.hour = [0, 6, 12, 18];
dailyReport.minute = 5;
dailyReport.second = 5;

weekdays = ['日', '一', '二', '三', '四', '五', '六', '日'];
jpweekdays = ['日', '月', '火', '水', '木', '金', '土', '日'];

/* case 1:
    n = 'https://www.youtube.com/channel/' + t;
break;
case 2:
    n = 'https://www.openrec.tv/user/' + t.substr(3);
break;
case 3:
    n = 'https://www.showroom-live.com/room/profile?room_id=' + JSON.parse(a).room_id;
break;
case 4:
    n = 'https://www.mirrativ.com/user/' + t.substr(3);
break;
case 5:
    n = 'https://colon-live.com/Usr/VTuberProfile?vTuberUserId=' + (t.slice(0, 8) + '-' + t.slice(8, 12) + '-' + t.slice(12, 16) + '-' + t.slice(16, 20) + '-' + t.slice(20));
break;
case 6:
    n = 'https://space.bilibili.com/' + t.substr(3);
break;
case 7:
    n = 'https://17.live/profile/r/' + t.substr(3);
break;
case 8:
    n = 'https://twitcasting.tv/' + JSON.parse(a).screen_name
} */

class Table {
    constructor(row, col, title) {
        this.row = Number(row);
        this.col = Number(col);
        this.title = String(title);
        this.elements = {};
        return this;
    }
    add(data) {
        let l_html = `<div class="cell">
        <div class="streamname">${name}</div>
        <div class="streamtitle">${title}</div>
        <div class="streampos">${position}</div>
        <div class="streamtime">${time}</div>
        </div>`;
        if (data.hour in this.elements) {
            this.elements[data.hour].push(l_html);
        } else {
            this.elements[data.hour] = [l_html, ];
        }
    }
    html() {
        let style = `body{background:white;color:black;margin:0;padding: 0;}
        .table{padding:0;border:black 3px solid;}
        .time{font-size:40px;display:table-cell;padding-top:50%;width:50px;border-right:black 1px solid;}
        .time>span{margin-top: -100%;display:block;top:0;position:relative}
        .title{height:40px;font-size:30px;}
        .cell{display:table-cell;word-wrap:break-word;}
        .tr{display: table-row;border-bottom:black 1.5px solid;}
        .table>div{text-align:center;}
        .name{font-size:20px;}`
        let title = `<div class="title"><b>DDLive</b><em>${getDate(Date.now())}</em></div>`
        let table_row = [];
        for (const row of this.elements) {
            table_row.push('<div class="tr">' + row.join("") + '</tr>');
        }

    }
}

function getDate(unix) {
    if (!unix || (typeof (unix) != "number" && isNaN(unix))) return false;
    let date = new Date(unix);
    return date.getFullYear() +
        "-" + date.getMonth().toString().padStart(2, '0') +
        "-" + date.getDate().toString().padStart(2, '0') +
        " " + date.getHours().toString().padStart(2, '0') +
        "-" + date.getMinutes().toString().padStart(2, '0') +
        "-" + date.getSeconds().toString().padStart(2, '0');
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
    //不含最大值，含最小值
}


/**
 * 
 * @param {Date} unix 
 * @returns {{
 *  ch_id: String,
 *  ch_type: Number,
 *  groups: String,
 *  groups_name: String,
 *  scheduled_start_time: Number,
 *  streamer_id: String,
 *  streamer_name: String,
 *  thumbnail_url: String,
 *  title: String,
 *  video_id:String,
 *}}
 */
async function getInfo(unix = Date.now()) {
    unix = (!unix || (typeof (unix) != "number" && isNaN(unix))) ? Date.now() : unix;
    let start = (getDate(unix));
    let end = (start ?
        start.substring(0, 8) + String(Number(start.substring(8, 2)) + 1) + start.substring(10) :
        false);
    let options = {
        url: ADDRESS,
        method: "POST",
        json: true,
        headers: {
            Host: "hiyoko.sonoj.net",
            Connection: "keep-alive",
            Accept: "application/json;charset=UTF-8",
            "Cache-Cotrol": "public, max-age=300",
            Origin: "https://hiyoko.sonoj.net",
            "Sec-Fetch-Mode": "cors",
            "Content-Type": "application/json",
            "Referer": "https://hiyoko.sonoj.net/schedule",
        },
        body: {
            "filter_state": "{ \
                \"open\": true, \
                \"selectedGroups\": \"\", \
                \"following\": false, \
                \"text\": \"\"}",
            start: start,
            end: end
        }
    }
    let data = await request(options);
    return Promise.resolve(data.schedules);
}

/**
 * 
 * @param {JSON[]} data 
 * @returns {{
 * hour:{
 *     data:{
 *          ch_id: String,
 *          ch_type: Number,
 *          groups: String,
 *          groups_name: String,
 *          scheduled_start_time: Number,
 *          streamer_id: String,
 *          streamer_name: String,
 *          thumbnail_url: String,
 *          title: String,
 *          video_id:String
 *     },
 *     count:Number
 * }}} hour is a number that contain schedule
 */
function parseInfo(data) {
    let time_line = {};
    let Today = Date.now().getDate();
    for (const item of data) {
        let item_date = new Date(item.scheduled_start_time);
        let day = item_date.getDate();
        let hour = item_date.getHours();
        if (day != Today) continue;
        if (hour in time_line) {
            time_line[hour].data.push(hour);
            time_line[hour].count += 1;
        } else {
            time_line[hour].data = [hour, ];
            time_line[hour].count = 1;
        }
    }
    return Object.freeze(time_line);
}

function getCanvas(data) {
    let hourly_live_count = [];
    for (const item of data) {
        hourly_live_count.push(item.count);
    }

    //every cell is 320*180
    //320px per cell, 2px for grid line, 50px for time
    let width = Math.max(...hourly_live_count) * (320 + 2) + 75;
    //180px per cell, 2px for grid line, 80px for title, 20px for footage
    let height = (Object.keys(data).length + 1) * (180 + 2) + 80 + 20;
    return {
        ctx: (new createCanvas(width, height).getContext('2d')),
        width: width,
        height: height
    };
}

function writeMultiText(ctx, text, x, y, width, font, fillStyle, baseline) {
    let chr = text.split("");
    let temp = "";
    let row = [];
    ctx.font = font || '20px "NotoSans"';
    ctx.fillStyle = fillStyle || "black";
    ctx.textBaseline = baseline || "bottom";
    for (let a = 0; a < chr.length; a++) {
        if (ctx.measureText(temp).width < width) {
            ;
        } else {
            row.push(temp);
            temp = "";
        }
        temp += chr[a];
    }
    row.push(temp);
    for (let b = 0; b < row.length; b++) {
        ctx.fillText(row[b], x, y + (b + 1) * 20);
    }
}

/**
 * 
 * @param {Object} ctx 
 * @param {Number} c_w Stand for Canvas Width
 * @param {Number} c_h Stand for Canvas Height
 * @param {Number[]} hours contain hours
 */
function fillBackground(ctx, c_w, c_h, hours, hour_counts) {
    let lines = hours.length;
    //Line 1 [Deep  color]
    //Line 2 [Light color]
    //Line 3 [Deep  color]
    //80 for alpha: #ffffff ==> #ffffff80
    let color = COLORS[getRandomInt(0, COLORS.length)];
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, c_w, c_h);

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, c_w, 80);
    for (let line = 0; line < lines; line++) {
        //get the line position
        //80px for title, 180px pre grid, 2px per line
        let position_cell_y = 80 + 2 + (180 + 2) * line;
        ctx.fillStyle = ((line + 1) % 2) == 0 ? color : color + "80";

        ctx.fillRect(0, position_cell_y, c_w, 180);

        //write the time
        ctx.fillStyle = "black";
        ctx.fillAlign = "middle";
        ctx.textBaseline = "middle";
        //25 is 50/2 (middle of time cell)
        //90 is 180/2 (middle of a cell)
        ctx.fillText(hours[line].padStart(2, "0"), 25, position_cell_y + 90);

        //draw cell lines
        //vertical
        ctx.fillStyle = "white";
        for (const count of hour_counts) {
            for (let x = 0; x < count; x++) {
                //50 for time cell, 320x180 per cell
                let position_cell_x = 50 + 320 * x;
                ctx.fillRect(position_cell_x, position_cell_y, 2, 182);
                ctx.fillRect(position_cell_x + 320, position_cell_y, 2, 182);
            }
        }
        //horizontal
        ctx.fillRect(0, position_cell_y, c_w, 2);
    }
}

/**
 * 
 * @param {Object} ctx 
 * @param {Number} c_w Stand for Canvas Width
 * @param {Number} c_h Stand for Canvas Height
 */
function fillCommentText(ctx, c_w, c_h) {
    //Version & Tips
    ctx.font = '20px "NotoSans"';
    ctx.textBaseline = 'top';

    ctx.textAlign = 'end';
    ctx.fillStyle = '#272727';
    ctx.fillText("Power By node-canvas, program by Gerard V1.0-beta", c_w - 5, 0);
    ctx.fillText("各位DD们~今天的主题色让你想到了哪位vtb呢", c_w - 5, 5);

    ctx.fillStyle = 'red';
    ctx.textAlign = 'start';
    ctx.fillText('可以用"!live:<时间>:<序号>"来查询详细信息，英文符号哟', 5, c_h - 5);
    ctx.fillText('例如21点的第二个：!live:21:2', 5, c_h - 5);

    ctx.textBaseline = 'bottom';
    //title
    ctx.font = '70px "NotoSans"';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(`DDLive</b><em>${getDate(Date.now())}`, c_w / 2, 75);

    //date
    ctx.font = '20px "NotoSans"';
    ctx.textAlign = 'end';
    ctx.fillStyle = '#272727';
    ctx.fillText(`${getDate(Date.now()).substr(0,10)} 星期${weekdays[new Date().getDay()]} / ${weekdays[new Date().getDay()]}曜日`, c_w, c_h);
}

function writeDetilText(ctx, data, position_row_x, position_line_in_y) {
    let type = data.ch_type,
        start_time_hour = String((new Date(data.scheduled_start_time)).getHours()).padStart(2, 0),
        start_time_minute = String((new Date(data.scheduled_start_time)).getMinutes()).padStart(2, 0),
        name = data.streamer_name,
        title = emoji.replace(data.title, emoji => '').replace(/\ufffd/ig, '');
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


schedule.scheduleJob({
    hour: 0,
    minute: 1
}, async () => {
    let date = Date.now();
    let schedule_data = parseInfo(await getInfo(date));
    fs.writeFile(`./schedule/${year}${month}${String(day).padStart(2, 0)}.json`,
        `${JSON.stringify(flatten(schedule_data))}`, (err) => {
            return new Error(err)
        });
    let canvas = getCanvas(schedule_data);
    let ctx = canvas.ctx;
    let width = canvas.width;
    let height = canvas.height;

    fillBackground(ctx, width, height, Object.keys(schedule_data), (() => {
        let hourly_live_count = [];
        for (const item of schedule_data) {
            hourly_live_count.push(item.count);
        }
        return hourly_live_count;
    })());
    fillCommentText(ctx, width, height);

    for (const schedule_item in schedule_data) {
        let stream_info = {
            ch_type: schedule_item.data.ch_type,
            scheduled_start_time: new Date(schedule_item.data.scheduled_start_time).toTimeString().substr(0, 5),
            streamer_name: schedule_item.data.streamer_name,
            title: schedule_item.data.title
        }
        writeDetilText(ctx, stream_info)
    }
})