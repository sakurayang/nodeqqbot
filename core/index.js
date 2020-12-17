//TODO: test
const request = require("request-promise-native");
const config = require("../config.js");
const utils = require("../plugin/utils");
const db = require("../plugin/db");
const logger = require("../plugin/logger").getLogger("core");

const address = config.bot.address;
const g_authKey = config.bot.authKey;
const g_qq = config.bot.qq;
const debug = config.debug;
const formatUri = utils.formatUri;
const knex = db.getCore(config.db.path);

class Bot {
    /**
     * @param {String} authKey
     * @param {Number|String} qq
     */
    constructor(authKey = g_authKey, qq = g_qq, auto_init = true) {
        this.authKey = authKey;
        this.qq = Number(qq);
        if (auto_init) init(this.authKey);
        return this;
    }

    async init() {
        let tableExist = await knex.schema.hasTable(`"${qq}"`);
        if (!tableExist) {
            logger.info("[init] table not found, create");
            await knex.schema.createTable(`"${qq}"`, table => {
                table.bigIncrements("id");
                table.timestamp("time").notNullable().index().comment("receive_time");
                table.bigInteger("group_id");
                table.bigInteger("sender_id").notNullable();
                table.text("sender_name");
                table.bigInteger("message_id").index().notNullable();
                table.text("message_type").notNullable();
                table.text("message_content").notNullable();
            });
        }
        logger.info("[init] table exist");
        this.sessionKey = await this.getKey();
        await this.verify(this.sessionKey, this.qq);
        await this.modify({
            enableWebsocket: true
        });
    }

    /**
     * @returns {String} SessionKey
     */
    async getKey() {
        let res = await request(formatUri("POST", address, "/auth", {
            authKey: this.authKey
        }));
        (res.code !== 0) ? logger.info("Auth success"):
            logger.error("Auth faild" + res.msg);
        if (debug) logger.info(JSON.stringify(res));
        return res.session;
    }

    /**
     *
     * @return {void}
     */
    async verify() {
        let res = await request(formatUri("POST", address, "/verify", {
            sessionkey: this.sessionKey,
            qq: this.qq
        }));
        (res.code !== 0) ? logger.info("Session verify success"):
            logger.error("Session verify faild" + res.msg);
        if (debug) logger.info(JSON.stringify(res));
        return;
    }

    /**
     *
     * @return {void}
     */
    async release() {
        let res = await request(formatUri("POST", address, "/release", {
            sessionKey: this.sessionKey,
            qq: this.qq
        }));
        (res.code !== 0) ? logger.info("Session release success"):
            logger.error("Session release faild" + res.msg);
        if (debug) logger.info(JSON.stringify(res));
        return;
    }

    /**
     * @param {JSON} config
     * @return {void}
     */
    async modify(config) {
        logger.info("change config: " + JSON.stringify(config));
        let res = await request(formatUri("POST", address, "/config", {
            sessionKey: this.sessionKey,
            ...config
        }));
        (res.code !== 0) ? logger.info("Config modify success"):
            logger.error("Config modify faild" + res.msg);
        if (debug) logger.info(JSON.stringify(res));
        return;
    }

    /**
     * 
     * @return {JSON[]}
     */
    async getGroupList() {
        let res = await request(formatUri("GET", address, "/groupList?sessionKey=" + this.sessionKey));
        logger.info("Get group list");
        if (debug) logger.info(JSON.stringify(res));
        return res;
    }

    /**
     * @param {"Friend"|"Group"} receiver_type
     * @param {Number|String} receiver_id
     * @param {{
            type:
                "Quote"|"At"   |"AtAll"     |"Face"|
                "Plain"|"Image"|"FlashImage"|"Xml" |
                "Json" |"App"  |"Poke"
            text: String,
            id: Number,
            target: Number,
            faceId: Number,
            imageId:String,
            url:String,
            path:String,
            senderId: Number,
            targetId: Number,
            origin: { type: String, text: String }[],
            name:String,
            json: String,
            xml: String,
            content: String
        }[]} message
     * @return {JSON}
     */
    async sendMessage(receiver_type, receiver_id, message) {
        if (debug) logger.info(`[send]: "${message}" to ${receiver_id}@${receiver_type}`);
        if (receiver_type.toLowerCase() == "friend" ||
            receiver_type.toLowerCase() == "group") {
            // conver first letter to upper case
            receiver_type =
                receiver_type.substring(0, 1).toUpperCase() +
                receiver_type.substring(1).toLowerCase();
        }
        let uri = formatUri("POST", address, `/send${receiver_type}Message`, {
            sessionKey: this.sessionKey,
            target: Number(receiver_id),
            messageChain: message
        });
        let res = await request(uri);
        if (res.code !== 0) logger.error("[send] error " + res.msg);
        return res;
    }

    /**
     * @param {Number} target
     * @return {String}
     */
    recallMessage(target) {
        let res = request(formatUri("POST", address, "/recall", {
            sessionKey: this.sessionKey,
            target
        }));
        logger.info("recall message");
        if (debug) logger.info(JSON.stringify(res));
        if (res.code !== 0) logger.error("[send] error " + res.msg);
        return res.msg;
    }
}

module.exports = Bot;