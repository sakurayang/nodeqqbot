const config = require("../config.json"),
    mysql = require("node-mysql-promise"),
    request = require("request");

var debug = config.debug,
    db = debug ? config.db.testdb : config.db.db,
    conn = mysql.createConnection(db);

/**
 * @constructor
 * 返回一个request的uri
 * @param {String} type group|private|discuss
 * @param {String} http_type POST|GET
 * @param {String} id Group_id|Friend_id|Disscuss_id
 * @param {String} text text
 * @param {JSON} headers http header
 */
class Uri {
    constructor(type, http_type = "POST", id, text, headers) {
        this.type = type;
        this.http_type = http_type;
        this.text = text;
        this.headers = headers;
        this.id = id;
        return {
            method: this.http_type,
            url: config.bot.address + "send_msg_async/",
            json: {
                gmessage_type: this.type,
                user_id: this.id,
                group_id: this.id,
                discuss_id: this.id,
                message: this.text
            },
            headers: this.headers
        };
    }
    getBody(type){
        switch (type) {
            case "private":
            default:
                return "user_id";
                break;
            case "group":
                return "group_id";
                break;
            case "disscuss":
                return "discuss_id";
                break;
        }
    }
}


/**
 * 主Send
 * @param {String} type group|private|discuss
 * @param {String} id Group_id|Friend_id|Disscuss_id
 * @param {String} text text
 */
function send(type, id, text) {
    let uri = new Uri(type, "POST", id, text, {
        "Content-Type": "application/json"
    });
    try {
        request(uri);
    } catch (error) {
        console.log(new Error(error));
    }
}

/**
 * 发送群组消息
 * @param {Array<string>|String} group 
 * @param {String} text 
 */

function sendGroupMsg(group, text) {
    let _group = Array.isArray(group) ? group : [group];
    _group.forEach(id => {
        conn.table("pause")
            .where({
                group_id: id
            }).select().limit(1)
            .then(data => {
                data[0].is_pause ?
                    console.log("pause") :
                    send("group", id, text);
            }).catch(err=>{
                console.error(new Error(err));
            })
    });
}

/**
 * 发送群组消息，无视数据库中的pause
 * @param {Array<string>|String} group 
 * @param {String} text 
 */

function sendGroupMsgAnyway(group, text) {
    let _group = Array.isArray(group) ? group : [group];
    _group.forEach(id => {
        send("group", id, text);
    });
}

/**
 * 发送私聊消息
 * @param {Array<String>|String} id 
 * @param {String} text 
 */

function sendPrivateMsg(id, text) {
    let _id = Array.isArray(id) ? id : [id];
    _id.forEach(id => {
        send("private",id,text);
    });
}

/**
 * 发送讨论组消息
 * @param {Array<String>|String} id 
 * @param {String} text 
 */

function sendDisscussMsg(disscuss, text) {
    let _disscuss = Array.isArray(disscuss) ? disscuss : [disscuss];
    _disscuss.forEach(id => {
        send("disscuss",id,text);
    });
}

function boardcast(text) {
    request("http://localhost:5700/get_group_list/",(err,res)=>{
        if (err) throw err;
        let group = JSON.parse(res.body).data;
        let groups=[];
        for (let i = 0, len = group.length; i < len; i++) {
            let id = group[i].group_id;
            groups[i] = id;
        }
        sendGroupMsgAnyway(groups,text);
    });
}

module.exports = {
    group: sendGroupMsg,
    groupAnyway: sendGroupMsgAnyway,
    private: sendPrivateMsg,
    disscuss: sendDisscussMsg,
    boardcast: boardcast
}