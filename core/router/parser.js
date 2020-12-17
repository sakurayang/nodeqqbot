const {isMainThread, Worker, parentPort, workerData} = require("worker_threads");

if (isMainThread) {
    module.exports = script =>
        new Promise((res, rej) => {
            const worker = new Worker(__filename, {
                workerData: script
            });
            worker.on("message", res);
            worker.on("error", rej);
            worker.on("exit", code => {
                if (code !== 0) rej(new Error(`Worker stopped with code ${code}`));
            });
        });
} else {
    require("module-alias/register");
    const {commands, formats} = require("@root/core/commands");
    const logger = require("@root/core/libs/logger").getLogger("core");

    /**
     *
     * @param {string} msg
     * @returns {boolean}
     */
    const isCommand = msg => msg.match(/^[.。].*/);

    async function parser(msg) {
        let message = msg.message.trim();
        if (isCommand(message)) return parseCommand(msg);
        else return "";
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
                return result;
            }
        }
        return "";
    }

    const script = workerData;
    (async () => {
        let result = await parser(script);
        logger.debug(result);
        parentPort.postMessage(result);
    })();
}
