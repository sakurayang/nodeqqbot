require("module-alias/register");
const fs = require("fs");
const path = require("path");
const schedule = require("node-schedule");

const {registerFont, createCanvas} = require("canvas");

const {Json2File, File2Json} = require("@libs/json");
const config = require("@root/config");
const logger = require("@libs/logger").getLogger("service");

const API_HOST = "https://hiyoko.sonoj.net/f/avtapi/schedule";

const axios = require("axios").default.create({
    baseURL: API_HOST,
    timeout: 60000,
    headers: {
        origin: "https://hiyoko.sonoj.net",
        referer: "https://hiyoko.sonoj.net/schedule/",
        host: "hiyoko.sonoj.net",
        dnt: "1",
        "Sec-Fetch-Mode": "cors",
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66",
        accept: "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "cache-control": "no-cache",
        "content-type": "application/json; charset=UTF-8",
        pragma: "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "none",
        cookie: "_ga=GA1.2.88612924.1609591119; _gid=GA1.2.937111044.1609591119; auto-readme=AGREE; lang=en"
    }
});

const SCHEDULE_RULE = {hour: 4, minute: 0};
// Fucking Political Correctness
const BLACKLIST = ["cover"];
const FONT = `"SourceHanSans"`;
const weekdays = ["日", "一", "二", "三", "四", "五", "六", "日"];
const jp_weekdays = ["日", "月", "火", "水", "木", "金", "土", "日"];
registerFont(path.join(__dirname, "SourceHanSansCN-Regular.otf"), {family: "SourceHanSans"});

/**
const requestExample = {
    filter_state: '{"open":false,"selectedGroups":"","following":false,"text":""}',
    start: "2021-01-02 20:48:26",
    end: "2021-01-09 06:00:00"
};
**/

/**
 *
 * @param {Number} id
 * @returns {String}
 */
function getChannel(id) {
    const ch_type = ["unknown", "Youtube", "OpenREC", "ShowRoom", "Mirrativ", "Colon", "Bilibili", "17Live", "twitch"];
    return ch_type[id];
}

/**
 *
 * @param {Date} unix
 * @returns {{format:"YYYY-MM-DD",compact:"YYYYMMDD"}}
 */
function getDate(unix) {
    if (!unix || (typeof unix != "number" && isNaN(unix))) return false;
    let date = new Date(unix);
    let format =
        date.getFullYear() +
        "-" +
        (date.getMonth() + 1).toString().padStart(2, "0") +
        "-" +
        date.getDate().toString().padStart(2, "0");
    /*+
    " " + date.getHours().toString().padStart(2, '0') +
    ":" + date.getMinutes().toString().padStart(2, '0') +
    ":" + date.getSeconds().toString().padStart(2, '0')
    */
    let compact = format.replace(/-/g, "").substring(4);
    return {format, compact};
}

async function getLiveScheduleInfo(unix) {
    let today = getDate(unix);
    let tomorrow = getDate(unix + 24 * 60 * 60 * 1000);
    let start = `${today.format} 05:00:00`;
    // 24 * 60 * 60 => seconds in a day *1000 => to ms
    let end = `${tomorrow.format} 05:00:00`;
    let filename = `${today.compact}-${tomorrow.compact}.json`;

    if (fs.existsSync(path.join(config.path.data, today.compact.substring(0, 4), filename))) {
        let result = await File2Json(filename);
        return result;
    }

    try {
        logger.log(`[liveSchedule] get Schedule form ${start} to ${end}`);
        let result = await axios.post("fetch_curr", {
            filter_state: JSON.stringify({open: false, selectedGroups: "", following: false, text: ""}),
            start,
            end
        });

        saveLiveSchedule(filename, result.data);
        return result.data;
    } catch (error) {
        logger.error("[liveSchedule]", error);
    }
}

function saveLiveSchedule(file, data) {
    let year = new Date().getFullYear();
    let dir = path.join(config.path.data, String(year));
    let isDirExist = fs.existsSync(dir);
    if (!isDirExist) fs.mkdirSync(dir);
    let isFileExist = fs.existsSync(path.join(dir, file));
    if (isFileExist) return;
    Json2File(path.join(String(year), file) + ".json", data);
}

/**
 *
 * @param {{schedules: {
 *  ch_id: String,
 *  ch_type: Number,
 *  groups: null|String,
 *  groups_name: null|String,
 *  scheduled_start_time: Number,
 *  streamer_id: String,
 *  streamer_name: String,
 *  streamer_name_en: null|String,
 *  thumbnail_url: import("url").Url,
 *  title: String,
 *  video_id: String
 *  }[]}} data
 * @returns {Map<number, {
 *  ch_id: String,
 *  ch_type: Number,
 *  groups: null|String,
 *  groups_name: null|String,
 *  scheduled_start_time: Number,
 *  streamer_id: String,
 *  streamer_name: String,
 *  streamer_name_en: null|String,
 *  thumbnail_url: import("url").Url,
 *  title: String,
 *  video_id: String
 *  }[]>} remove blacklist group from list
 */
function parseScheduleInfo(data) {
    const emoji_regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g;
    let schedules = data.schedules;
    let filter = new Map();
    let today = new Date().getDate();

    for (const live of schedules) {
        let groups = live["groups"];
        if (BLACKLIST.includes(groups)) continue;
        let _live = {...live};
        _live.title.replace(emoji_regex, "");
        let stream_time = live.scheduled_start_time;
        let hour = new Date(stream_time).getHours();
        if (new Date(stream_time).getDate() !== today) hour += 24;
        if (filter.has(hour)) filter.get(hour).push(_live);
        else filter.set(hour, [_live]);
    }

    return filter;
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {*} text
 * @param {*} pos_x
 * @param {*} pos_y
 * @param {*} width
 */
function drawText(ctx, text, pos_x, pos_y, width) {
    ctx.save();
    var chr = text.split("");
    var temp = "";
    var row = [];

    for (let a = 0; a < chr.length; a++) {
        if (ctx.measureText(temp).width < width) {
        } else {
            row.push(temp);
            temp = "";
        }
        temp += chr[a];
    }
    row.push(temp);
    for (var b = 0; b < row.length; b++) {
        ctx.fillText(row[b], pos_x, pos_y + (b + 1) * Number(ctx.font.substring(0, 2)));
    }
    ctx.restore();
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} pos_x
 * @param {Number} pos_y
 * @param {Number} width
 * @param {Number} height
 * @param {String} color
 */
function drawCell(ctx, pos_x, pos_y, width, height, color) {
    ctx.save();
    ctx.fillStyle = color;
    // 1px for grid line
    ctx.fillRect(pos_x + 1, pos_y + 1, width, height);
    // draw border
    ctx.fillStyle = "black";
    // top
    ctx.fillRect(pos_x, pos_y, width + 2, 1);
    // left
    ctx.fillRect(pos_x, pos_y, 1, height + 2);
    // bottom
    ctx.fillRect(pos_x, pos_y + height + 1, width + 2, 1);
    // right
    ctx.fillRect(pos_x + width + 1, pos_y, 1, height + 2);
    ctx.restore();
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} canvas_width
 * @param {Number} canvas_height
 * @param {Number} unix
 * @returns {void}
 */
function drawBackgroundText(ctx, canvas_width, canvas_height, unix) {
    ctx.save();
    // withe background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas_width, canvas_height);

    // 旁注
    ctx.font = "10px " + FONT;
    ctx.textAlign = "end";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#272727";
    ctx.fillText("Power By Canvas, program by Gerard V1.0-beta", canvas_width - 5, 0);
    // ctx.fillStyle = "red";
    // ctx.textAlign = "start";
    // ctx.fillText('可以用"!live:<时间>:<序号>"来查询详细信息，英文符号哟', 5, canvas_height - 35);
    // ctx.fillText("例如21点的第二个：!live:21:2", 5, canvas_height - 20);

    //标题
    ctx.font = "80px " + FONT;
    ctx.fillStyle = "black";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "center";
    ctx.fillText("监控室老大爷日刊", canvas_width / 2, 90);
    /*  // 画标题分隔线
        ctx.fillStyle = "black";
        ctx.fillRect(10, 125, canvas_width - 10, 2);
     */

    // 日期
    let date = new Date(unix);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let week = date.getDay();
    ctx.font = "10px " + FONT;
    ctx.textAlign = "end";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#272727";
    ctx.fillText(
        `${year}年${month}月${day}日 星期${weekdays[week]} ${jp_weekdays[week]}曜日`,
        canvas_width,
        canvas_height
    );
    ctx.restore();
}

async function getLiveScheduleImage(unix) {
    let raw_data = await getLiveScheduleInfo(unix);
    // let raw_data = await File2Json("test_data.json");
    let info = parseScheduleInfo(raw_data);
    const max_cell_pre_row = 10;
    // unit: px
    const per_cell_width = 200;
    const per_cell_height = (per_cell_width * 9) / 16;

    // how many rows need
    let active_live_hours = info.size;
    // ...and how many rows need if 10 cells pre row
    let total_rows = active_live_hours;
    // save row info such as lives and pos
    let row_info = new Map();

    let most_live = 0;

    for (const [hour, live] of info) {
        row_info.set(hour, live.length);
        if (live.length > max_cell_pre_row) total_rows += Math.ceil(live.length / max_cell_pre_row) - 1;
        if (live.length > most_live) most_live = live.length;
    }

    // 1px for grid line, 50px for time
    let canvas_width =
        (most_live > max_cell_pre_row ? max_cell_pre_row : most_live) * (per_cell_width + 1) + per_cell_width * 0.8;
    // 1px for grid line, 100px for title
    let canvas_height = total_rows * (per_cell_height + 1) + 100;
    let canvas = createCanvas(canvas_width, canvas_height);
    let ctx = canvas.getContext("2d");

    drawBackgroundText(ctx, canvas_width, canvas_height, unix);

    let y_offset = 100;
    for (const [hour, lives_array] of info) {
        let copy_array = Array.from(lives_array);
        ctx.save();
        const line = Array.from(info.keys()).indexOf(hour);
        let rows = Math.ceil(row_info.get(hour) / max_cell_pre_row);
        let color = (line + 1) % 2 == 0 ? "#2f2f2f" : "#2f2f2f" + "80";
        drawCell(ctx, -1, y_offset, per_cell_width * 0.8, rows * per_cell_height, color);
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "50px " + FONT;
        ctx.fillText(String(hour), per_cell_width * 0.8 * 0.5, y_offset + (rows * per_cell_height) / 2);
        for (let group = 0; group < Math.ceil(lives_array.length / max_cell_pre_row); group++) {
            const live_group_array = copy_array.splice(0, 10);
            for (const live of live_group_array) {
                const cell_x = per_cell_width * 0.8 + 1 + live_group_array.indexOf(live) * (per_cell_width + 1);
                const cell_y = y_offset + group * per_cell_height;
                ctx.save();
                drawCell(ctx, cell_x, cell_y, per_cell_width, per_cell_height, color);

                ctx.textAlign = "start";
                ctx.font = "20px bold " + FONT;
                ctx.fillStyle = "black";
                ctx.textBaseline = "top";
                let title = live.title.length > 30 ? live.title.substring(0, 30) + "..." : live.title;
                let name = live.streamer_name;
                let ch = getChannel(live.ch_type);
                let start_min = new Date(Number(live.scheduled_start_time)).getMinutes();
                drawText(ctx, title, cell_x + 1, cell_y - 18, per_cell_width - 18);
                ctx.font = "15px bold " + FONT;
                ctx.textBaseline = "bottom";
                drawText(
                    ctx,
                    `${name} @ ${ch}`,
                    cell_x + 1,
                    cell_y + per_cell_height - Number(ctx.font.substring(0, 2)) - 1,
                    per_cell_width - 2
                );
                ctx.textAlign = "end";
                ctx.textBaseline = "middle";
                drawText(
                    ctx,
                    `${hour}:${String(start_min).padEnd(2, "0")}`,
                    cell_x + per_cell_width - 5,
                    cell_y + per_cell_height / 2,
                    per_cell_width
                );
                ctx.restore();
            }
        }

        ctx.restore();
        y_offset += rows * per_cell_height;
    }

    canvas.createJPEGStream().pipe(fs.createWriteStream("./test.jpeg", {autoClose: 1}));
}

// getLiveScheduleImage().catch(err => logger.error(err));

schedule.scheduleJob("liveSchedule", SCHEDULE_RULE, getLiveScheduleImage);
