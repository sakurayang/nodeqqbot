const he = require('he');
const mysql = require('node-mysql-promise');

async function check(id) {
    let conn = mysql.createConnection(db);
    let reply = '';
    if (id == null || id == undefined) return Promise.reject("请正确书写命令格式");
    await conn
        .table('work')
        .where({
            id: id
        }).limit(1)
        .select()
        .then(data => {
            if (data == '' || data == undefined) return Promise.reject("暂无数据")

            reply = "\n你查询的id是" + data[0].id +
                "\n标题：" + he.decode(data[0].title) +
                "\n地址：" + data[0].url +
                "\n发布日期：" + (new Date(Number(data[0].postdate))).toLocaleString("zh-Hans-CN", {
                    hour12: false,
                    timeZone: "Asia/Shanghai"
                }) +
                "\n时轴：" + ((data[0].time == "not") ? "暂无" : "[CQ:at,qq=" + data[0].time + "]") +
                "\n校对：" + ((data[0].tran == "not") ? "暂无" : "[CQ:at,qq=" + data[0].tran + "]") +
                "\n翻译：" + ((data[0].corr == "not") ? "暂无" : "[CQ:at,qq=" + data[0].corr + "]");
        }).catch(error => {
            console.log(error);
            return Promise.reject("出现错误");
        });
    return reply;
}

async function take(id, type, name) {
    let conn = mysql.createConnection(db);
    if ((sub.length < 4) || (id == undefined || id == null) || (work_type == undefined || work_type == null)) return Promise.reject("请正确书写命令格式");
    await conn
        .table('work')
        .where({
            id: id
        }).select()
        .then(data => {
            if (data[type].toLocaleLowerCase() != "not") {
                return `接取失败，该任务已分配（或被接取），任务人：${data[work_type]}`
            } else {
                await update(id, data[type]).then(res => {
                    return Promise.resolve(res);
                }).catch(err => {
                    return Promise.reject(err)
                });
            }
        }).catch(err => {
            return Promise.reject(err);
        });
}

async function update(id, data) {
    let conn = mysql.createConnection(db);
    conn.table('work')
        .where({
            id: id
        })
        .update(data)
        .catch(err => {
            console.log(err);
            return Promise.reject("因内部错误失败，[CQ:at,qq=1304274443]起床修BUG啦啦啦啦啦啦");
        }).then(() => {
            return Promise.resolve("成功");
        });
}

async function change(id, type, name) {
    let conn = mysql.createConnection(db);
    await update(id, JSON.parse(`{"${type}":"${name}"}`)).then(res => {
        conn.table('work')
            .where({
                id: id
            }).limit(1)
            .select().then(data => {
                return data[0][type] == name ? "成功" : "失败";
            })
    })
}

module.exports = {
    check: check,
    take: take,
    change: change
}