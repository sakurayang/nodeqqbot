require("module-alias/register");
const app = require("@core/router");
const config = require("./config");
const logger = require("@libs/logger").getLogger("core");

config.debug ? logger.info("Debug on") : null;

app.listen(config.web.port, () => logger.info("ready, listen port: " + config.web.port));

// const {Worker} = require("worker_threads");
// const path = require("path");
// const fs = require("fs");

// let services = fs.readdirSync(path.join(__dirname, "core", "services"));
// for (const file of services) {
//     if (!file.endsWith(".js")) continue;
//     new Promise((res, rej) => {
//         const worker = new Worker(path.join(__dirname + "/core/services/" + file));
//         //worker.on("message",res);
//         worker.on("error", rej);
//         worker.once("online", () => logger.info(`services ${file} start up`));
//     })
//         //.then()
//         .catch(err => logger.error(err));
// }

const storage = require("node-global-storage");
const {File2Json} = require("@libs/json");
(async () => {
    let recover = await File2Json("storage.json");
    for (const group of recover) {
        let key = Object.keys(group)[0];
        storage.set(key, group[key]);
    }
})();
