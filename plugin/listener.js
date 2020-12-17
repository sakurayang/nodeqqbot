const Bot = require("../core");
const db = require("./db");
const logger = require("./logger").getLogger("core");
const utils = require("./utils");
const config = require("../config");
const filename = config.db.path;
const debug = config.debug;

/**
 * @param {JSON} message
 */
async function parsePacket(message) {
    logger.info("[receive message] " + JSON.stringify(message));
    let message_chain = message.messageChain;
    let message_type = message.type;
    let parsed_message = parseChain(message_chain, {
        id: 0,
        time: Date.now(),
        receive_time: Date.now(),
        group_id: message_type === "GroupMessage" ? message.sender.group.id : null,
        sender_id: message.sender.id,
        sender_name: message_type === "GroupMessage" ? message.sender.memberName : message.sender.nickname,
        message_id: 0,
        message_type,
        message_content: ""
    });
    if (debug) logger.info("[DEBUG][parse chain] " + JSON.stringify(parsed_message));
    write2db(parsed_message);
}

/**
 * 
 * @param {JSON[]} chain
 */
function parseChain(chain, res = {}) {
    if (!chain || chain.length === 0) return res;
    res = Object.keys(res) === 0 ? {
        id: 0,
        time: 0,
        receive_time: 0,
        group_id: 0,
        sender_id: 0,
        sender_name: "0",
        message_id: 0,
        message_type: "0",
        message_content: ""
    } : res;
    let message = chain.shift();
    let type = message.type;
    switch (type) {
        case "Source": {
            res.id = message.id;
            res.receive_time = message.receive_time;
            res.time = Date.now();
            break;
        }
        case "Plain": {
            let text = message.text;
            res.message_content += res.message_content.length === 0 ? text : "\n" + text;
            if (String(text).startsWith(/^[\.|。]..*/ig)) parseCommand(text);
            break;
        }
        case "Image": {
            let url = message.url;
            res.message_content += res.message_content.length === 0 ? url : "\n" + url;
            break;
        }
        case "At": {
            if (message.target === config.bot.qq) {
                if (res.message === "" && chain.length === 0) {
                    // 当只有一个at的时候
                    reply(res.message_type, res.receiver_id, {
                        type: "Plain",
                        text: "at我干嘛"
                    });
                } else if (res.message === "" && chain.length !== 0) {
                    // at在最前面
                    if (chain[0].type === "Plain" && res.sender_id === 1304274443) {
                        if (chain[0].text === "status") {
                            //TODO: show status
                        } else if (chain[0].text === "reboot") {
                            //TODO: reboot
                        } else {
                            reply(res.message_type, res.receiver_id, {
                                type: "Plain",
                                text: "本小姐听不懂你在说什么！"
                            });
                        }
                    };
                } else if (res.message !== "" && chain.length === 0) {
                    // at在最后面
                    //TODO: just parse words in res
                } else if (res.message !== "" && chain.length !== 0) {
                    //TODO: combine above 2
                } else {
                    // 异次元的at
                    //TODO: 报个错
                }
            };
            res.message_content += res.message_content.length === 0 ?
                `@${message.target}` :
                "\n" + `@${message.target}`;
            break;
        }
        case "Json":
        case "Xml":
        case "App":
        case "Poke":
        case "Face":
        case "AtAll":
        case "Quote":
        default:
            break;
    }
    return parseChain(chain, res);
}

/**
 * 
 * @param {String} text 
 */
function parseCommand(text) {
    let command_chain = text.split(" ");
    let cmd = command_chain[0].replace(/\.|。/, "");
    switch (cmd) {
        case "translate": {
            break;
        }
        case "live": {
            break;
        }
        case "ra":
        case "rd":
        case "roll": {
            //TODO: roll
            break;
        }
        default:
            break;
    }
}

/**
 * 
 * @param {{
        id: Number,
        time: Date,
        receive_time: Date,
        group_id: Number,
        sender_id: Number,
        sender_name: String,
        message_id: Number,
        message_type: String,
        message_content: String
    }} params 
 */
function write2db(params) {
    db.insert(filename, `"${config.bot.qq}"`, params);
    return;
}

/**
 * 
 * @param {"Group"|"Friend"} receiver_type 
 * @param {Number} receiver_id 
 * @param {JSON} message
 * @returns {void}
 */
async function reply(receiver_type, receiver_id, message) {
    logger.info("reply " + JSON.stringify(message));
    try {
        let client = new Bot(config.bot.authKey, config.bot.qq, true);
        await client.sendMessage(receiver_type, receiver_id, message);
        client.release();
    } catch (err) {
        logger.error(err);
    }
    return;
}

module.exports = parsePacket;