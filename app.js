const hmr = require("node-hmr");
let config;
const plugin = require("./plugin");
hmr(() => {
    console.log("reload");
    config = require("./config");;
});

const koa = require("koa");
const _ = require("koa-route");
const bodyparser = require("koa-bodyparser");
const cors = require("@koa/cors");

const receive = plugin.listener;
const logger = plugin.logger.getLogger("init");
logger.mark("loaded");

const app = new koa();
app.use(cors());
app.use(bodyparser());
app.use(_.post("/receive", async ctx => {
    ctx.status = 200;
    receive(ctx.request.body);
    return;
}));

app.listen(config.bot.listen_port, () => logger.info("ready, listen port: " + config.bot.listen_port));