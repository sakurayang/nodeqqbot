require("module-alias/register");
const app = require("./core/router");
const config = require("./config");
const logger = require("./core/libs/logger").getLogger("core");

config.debug ? logger.info("Debug on") : null;

app.listen(config.web.port, () => logger.info("ready, listen port: " + config.web.port));
