const Application = require("koa");
const parser = require("./parser");
const logger = require("@core/libs/logger").getLogger("http");
/**
 *
 * @param {Application.ParameterizedContext} ctx
 */
module.exports = async ctx => {
    logger.debug("[data]" + ctx.request.rawBody);
    let result = await parser(JSON.parse(ctx.request.rawBody));
    logger.debug(
        `[return] ${JSON.stringify({
            reply: result
        })}`
    );
    if (result.length > 0) {
        ctx.res.writeHead(200, {
            "Content-Type": "application/json"
        });
        ctx.res.write(
            JSON.stringify({
                reply: result
            })
        );
        ctx.res.end();
    } else {
        ctx.res.writeHead(204, {
            "Content-Type": "application/json"
        });
        ctx.res.end();
    }
    return;
};
