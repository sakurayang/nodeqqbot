const config = require("@root/config");
const koa = require("koa");
const Cors = require("koa2-cors");
const logger = require("@root/core/libs/logger").getLogger("http");
const router = require("./router");
const koaBodyparser = require("koa-bodyparser");

const app = new koa();
const cors = Cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"]
});

app.use(async (ctx, next) => {
    const start = Date.now();
    const self_id = ctx.header["X-Self-ID"] || "unknown";
    let log_str = `[Mirai (${self_id})]`;
    logger.info(log_str + `[${ctx.method}] ${ctx.url}`);
    await next();
    const ms = Date.now() - start;
    logger.info(log_str + `[${ctx.method}] ${ctx.url} - complate in ${ms}ms`);
});
app.use(koaBodyparser());
app.use(cors);
app.use(router);

module.exports = app;
