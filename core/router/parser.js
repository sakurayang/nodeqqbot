require("module-alias/register");
const {commands, formats} = require("@core/commands");
const logger = require("@core/libs/logger").getLogger("core");

/**
 *
 * @param {string} msg
 * @returns {boolean}
 */
const isCommand = msg => msg.match(/^[.。].*/);

async function parser(msg) {
    if (!"message" in msg) return;
    let message = msg.message || "";
    if (isCommand(message)) return await parseCommand(msg);
    else return;
}

async function parseCommand(msg) {
    let message = msg.message.replace(/.|。/, "").trim();
    let sender = msg.sender;

    let msg_command_split = message.split(" ");
    let msg_command_body = msg_command_split.shift();
    let msg_command_params = msg_command_split.length > 0 ? msg_command_split : [];
    logger.debug(`[command] command: ${msg_command_body} params: ${msg_command_params.join(" ")}`);

    for (const command of Array.from(formats.keys())) {
        if (msg_command_body.length < command.length) continue;
        let regexp = RegExp(formats.get(command));
        if (regexp.test(msg_command_body)) {
            let result = await commands.get(command)(msg_command_params, sender, msg);
            logger.debug(`[command] result: ${result}`);
            return result;
        }
    }
    return "";
}

module.exports = parser;
