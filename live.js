const request = require('request'),
    schedule = require('node-schedule'),
    fs = require('fs'),
    config = require('./config.json'),
    mysql = require('mysql'),
    emoji = require('node-emoji'),
    { registerFont, createCanvas } = require('canvas'),
    flatten = require("flat"),
    api_adress = 'https://hiyoko.sonoj.net/f/avtapi/schedule/fetch_curr';

var address = config.address;
var debug = 0;

groups = ["118047250", "739889796", "591845717"];
//groups = ["118047250"];
colors = config.colors;

registerFont("./fonts/NotoSansCJKjp-Regular.otf", { "family": "NotoSans" });
registerFont("./fonts/NotoSansCJKsc-Regular.otf", { "family": "NotoSans" });

var dailyReport = new schedule.RecurrenceRule();
dailyReport.hour = [0,6,12,18];
dailyReport.minute = 0;
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
        if (ctx.measureText(temp).width < w) {; } else {
            row.push(temp);
            temp = "";
        }
        temp += chr[a];
    }
    row.push(temp);
    for (var b = 0; b < row.length; b++) { ctx.fillText(row[b], x, y + (b + 1) * 20); }
}

function send(send_text) {
    for (let i = 0, len = groups.length; i < len; i++) {
        try {
            debug ? fs.writeFileSync("./debug.log", send_text, { flag: "a+" }) :
                request({
                    url: address,
                    method: 'POST',
                    json: {
                        group_id: groups[i],
                        message: send_text
                    }
                });
        } catch (error) {
            console.log(error);
        }
    }

}

function drawBackground(ctx, color, max) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas_width, canvas_height);
    //旁注
    ctx.font = '15px "NotoSans"';
    ctx.textAlign = 'end';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#272727';
    ctx.fillText("Power By node-canvas, program by Gerard V0.1-beta", canvas_width - 5, 0);
    ctx.fillText("各位DD们~今天的主题色让你想到了哪位vtb呢", canvas_width - 5, 15);
    ctx.textAlign ='start';
    ctx.fillText('可以用"!live:<时间>:<序号>"来查询详细信息，英文符号哟', 5, canvas_height - 35);
    ctx.fillText('例如21点的第二个：!live:21:2', 5, canvas_height - 20);
    //标题
    ctx.font = '100px "NotoSans"';
    ctx.fillStyle = color;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    ctx.fillText("DDLive日刊", canvas_width / 2, 120);
    /*     //画标题分隔线
        ctx.fillStyle = "black";
        ctx.fillRect(10, 125, canvas_width - 10, 2);
     */
}

weekdays = ['日', '一', '二', '三', '四', '五', '六', '日'];
jpweekdays = ['日', '月', '火', '水', '木', '金', '土', '日'];
locale = ['', 'YouTube', 'OpenRec', 'ShowRoom', 'Mirrativ', 'Colon-Live', 'Bilibili', '17.live'];

function test() {
    let date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        week = date.getDay();
    let options = {
        url: api_adress,
        method: "POST",
        json: true,
        json: {
            "user_token": null,
            "start": `${year}-${String(month).padStart(2, 0)}-${String(day).padStart(2, 0)} 00:00:00`,
            "end": `${year}-${String(month).padStart(2, 0)}-${String(Number(day) + 1).padStart(2, 0)} 00:00:00`
        }
    };
    request(options, (err, res, body) => {
        if (err || res.statusCode == 404)
            console.log(err);

        let liveSchedule = body.schedules;
        let timeLine = [];
        let count = [];
        liveSchedule.forEach((element) => {
            let hour = Number((new Date(element.scheduled_start_time)).getHours());
            if (timeLine[hour]) {
                timeLine[hour].push(element);
                count[hour]++;
            } else {
                timeLine[hour] = [element];
                count[hour] = 1;
            }
        });
        fs.writeFile(`./${year}${month}${day}.json`, `${JSON.stringify(flatten(timeLine))}`, (err) => { console.log(err) });
        // var conn = mysql.createConnection(config.db);
        // try {
        //     conn.connect();
        //     conn.query(`INSERT INTO live values(0,"${year} - ${String(month).padStart(2, 0)} - ${String(day).padStart(2, 0)}",'${JSON.stringify(flatten(timeLine))}')`);
        //     conn.end();
        // } catch (err) {
        //     console.log(err);
        // }
        let count_flat = [];
        count.forEach(value => {
            value ? count_flat.push(value) : b;
        });
        count = count_flat;
        canvas_width = Math.max(...count) * 320 + 175 + 20;
        canvas_height = count.length * 182 + 200;
        let canvas = new createCanvas(canvas_width, canvas_height);
        let ctx = canvas.getContext('2d');
        let color = "#" + colors[getRandomInt(0, colors.length)];
        //画背景
        drawBackground(ctx, color, Math.max(...count));

        let line = 0; //计数器
        timeLine.forEach((value, index) => {
            ctx.font = '50px "NotoSans"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let position_line_in_y = 127 + 182 * line;
            if (value) {
                //画时间分段背景
                ((line + 1) % 2) == 0 ? ctx.fillStyle = color : ctx.fillStyle = color + "80";
                ctx.fillRect(10, position_line_in_y, canvas_width - 20, 180);
                //时间
                ctx.fillStyle = "black";
                ctx.fillText(String(index).padStart(2, 0) + ":00", 100, position_line_in_y + 90);
                let row = 0; //列数
                value.forEach(data => {
                    let position_row_x = 192 + 320 * row;
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
                    row = row + 1;
                });
                //计数器+1
                line = line + 1;
            } else {
                line = line;
            }
        });


        //日期
        ctx.font = '10px "NotoSans"';
        ctx.textAlign = 'end';
        ctx.textBaseline = "bottom"
        ctx.fillStyle = '#272727';
        ctx.fillText(`${year}年${month}月${day}日 星期${weekdays[week]} ${jpweekdays[week]}曜日`, canvas_width, canvas_height);
        //输出
        //let base64 = canvas.toDataURL().substr(22);
        //send(`[CQ:image,file=base64://${base64}]`);
        canvas.createPNGStream().pipe(fs.createWriteStream(`/var/www/html/${year}${month}${day}.png`, { autoClose: 1 }).on("finish", () => {
            console.log('The PNG file was created.');
            send(`[CQ:image,file=http://server.bkwhentai.top/${year}${month}${day}.png]`)
        }));

    });
}

//test();
 schedule.scheduleJob(dailyReport, () => {

     test();

 });