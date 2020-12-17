const Chance = require("chance");
const db = require("@root/core/libs/db");
const knex = db.getCore();
(async ()=>{
    let isTableExist = await knex.schema.hasTable("nickname");
    if (!isTableExist) {
        await knex.schema.createTable("nickname",table=>{
            table.string("nick").notNullable();
            table.bigInteger("group").notNullable();
            table.bigInteger("qq").notNullable();
            table.bigIncrements("id");
            table.index("id");
        });
    }
})()

function roll(dice) {
    let chance = new Chance(Date.now());
    return chance.integer({min: 1, max: dice});
}

async function nn(params, sender, msg) {
    if (msg.message_type !== "group") return "请在群内更改昵称";
    let now_nick = params.join("").trim();
    let group = msg.group_id;
    let id = sender.user_id;
    let prev_name = await getNick(group, id);
    if (!prev_name) {
        let result = await db.insert("nickname", {
            group,
            id,
            nick: now_nick
        });
        prev_name = sender.card || sender.nickname || sender.user_id;
        if (result.code !== 0) return `数据库出错，请联系管理员`;
        return `${prev_name} 成功将昵称更改为 ${now_nick}`;
    } else {
        let result = db.update("nickname", {group, qq:id}, {nick: now_nick});
        if (result.code !== 0) return `数据库出错，请联系管理员`;
        return `${prev_name.result[0].nick} 成功将昵称更改为 ${now_nick}`;
    }
    return `未知错误，请联系管理员`;
}

async function getNick(group, id) {
    let result = await db.select("nickname", `group=${group} and qq=${id}`);
    return result.code !== 0 ? false : result.result[0].nick || false;
}
async function r(params, sender, msg) {
    let command = msg.message;
    let id = sender.user_id;
    let name = await getNick(msg.group_id, id) || sender.card || sender.nickname;
    let str = command.replace(/[.。]r/i, "");
    let chance = new Chance(Date.now());
    let time = str.split(/d/i)[0];
    let roll = chance.rpg(str);
    let result = Number(time)===1 ? roll.join("") : `{${roll.join(",")}}=${roll.reduce((a,b)=>a+b,0)}`;
    return `${name}掷骰 r${str}=${result}`;
}

module.exports = {
    r: {
        desc: "r#d#",
        docs: "r#d#",
        r,
        format: /r[\d]+d((\d{1,2})|100)$/
    },
    nn:{
        decs:"nickname",
        docs:"nickname",
        nn,
        format: /nn[\w]*/
    }
};
