const axios = require("./axios");
const logger = require("./logger").getLogger("core");
/**
 *
 * @param {import("./message_handle").msg} msg
 * @returns {import("axios").AxiosResponse<any>.data}
 */
async function send(msg) {
    logger.log("[send message]", msg);
    try {
        let result = await axios.get("/send_msg", {
            params: msg
        });
        logger.info("[send message] success, message_id is " + result.data.message_id);
        return result.data;
    } catch (error) {
        logger.error("[send message] ", error);
    }
}

/**
 *
 * @param {number} id
 * @returns {void}
 */
function recall(id) {
    logger.log("[recall message] id: " + id);
    axios.post("/delete_msg", {
        message_id: id
    });
}

module.exports = {
    send,
    recall
};
