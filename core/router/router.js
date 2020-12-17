const Application = require("koa");
const parser = require("./parser");
const logger = require("@root/core/libs/logger").getLogger("http");
/**
 *
 * @param {Application.ParameterizedContext} ctx
 */
module.exports = async ctx => {
    ctx.status = 200;
    logger.debug("[data]" + ctx.request.rawBody);
    let result = await parser(JSON.parse(ctx.request.rawBody));
    ctx.body = {
        replay: result
    };
};
