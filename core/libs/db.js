const config = require("@root/config");
const debug = config.debug;
const logger = require("./logger").getLogger("database");
const knex_options = {
    client: config.database.client,
    useNullAsDefault: true,
    asyncStackTraces: debug,
    connection: config.database.connection,
    log: {
        warn: message => logger.warn(message),
        error: message => logger.error(message),
        deprecate: message => logger.mark(message),
        debug: message => logger.debug(message)
    },
    debug
};

const knex = require("knex")(knex_options);

function parseObject(obj) {
    let keys = Object.keys(obj);
    let values = Object.values(obj);
    let transform = [];
    let isArray = Array.isArray(obj);

    for (const key in obj) {
        isArray ? (transform[key] = obj[key]) : transform.push(`${key}=${obj[key]}`);
    }
    return {
        keys,
        values,
        length: keys.length,
        transform,
        sql_string: transform.toString().replace(",", " and ")
    };
}

/**
 *
 * @param {String} table
 * @param {String} params
 * @param {Number} limit
 * @param {Number} offset
 * @return {{code:Number,msg:String,result:Array}}
 */
async function select(table, params = "", limit = 1, offset = 0) {
    if (debug) logger.info(`[select] [${table}] params: ${JSON.stringify(params)}, limit: ${limit}, offset: ${offset}`);
    try {
        let result = await knex(table)
            .whereBetween("id", [offset, offset + limit])
            .andWhereRaw(params);
        return {
            code: 0,
            msg: "",
            result
        };
    } catch (error) {
        logger.error(`[select] ${error}`);
        return {
            code: -1,
            msg: error
        };
    }
}

/**
 *
 * @param {String} table
 * @param {String} params
 * @param {Number} limit
 * @param {Number} offset
 * @return {JSON}
 */
async function selectLast(table, params = "", limit = 1, offset = -1) {
    if (debug) logger.info(`[select] [${table}] params: ${JSON.stringify(params)}, limit: ${limit}, offset: ${offset}`);
    try {
        let result = await knex(table).limit(limit).andWhereRaw(params).orderBy("id", "desc");
        return {
            code: 0,
            msg: "",
            result
        };
    } catch (error) {
        logger.error(`[select] ${error}`);
        return {
            code: -1,
            msg: error
        };
    }
}

/**
 *
 * @param {String} table
 * @param {String} params
 * @param {Number} limit
 * @param {Number} offset
 * @return {JSON}
 */
async function selectAll(table, params = "", limit = 1, offset = -1) {
    if (debug) logger.info(`[select] [${table}] params: ${JSON.stringify(params)}, limit: ${limit}, offset: ${offset}`);
    try {
        let result = await knex(table).where("id", ">", offset).andWhereRaw(params).select("*");
        return {
            code: 0,
            msg: "",
            result
        };
    } catch (error) {
        logger.error(`[selectAll] ${error}`);
        return {code: -1, msg: error};
    }
}

/**
 *
 * @param {String} table
 * @param {String} params
 * @return {JSON}
 */
async function getCount(table, params = "") {
    if (debug) logger.info(`[count] [${table}] params: ${JSON.stringify(params)}`);
    try {
        let count = await (await knex(table).whereRaw(params).select("*")).length;
        return {
            code: 0,
            result: count
        };
    } catch (error) {
        logger.error(`[getCount] ${error}`);
        return {
            code: -1,
            msg: error
        };
    }
}

/**
 *
 * @param {String} table
 * @param {JSON[]} values
 */
async function insert(table, values) {
    if (debug) logger.log(`[insert] [${table}] values: ${JSON.stringify(values)}`);
    try {
        await knex(table).insert(values);
        return {
            code: 0,
            msg: ""
        };
    } catch (error) {
        logger.error(`[insert] ${error}`);
        return {
            code: -1,
            msg: error
        };
    }
}

/**
 *
 * @param {String} table
 * @param {JSON} params
 */
// add "_" before function name cause delete is a kept word in js
function _delete(table, params) {
    if (debug) logger.log(`[delete] [${table}] params: ${JSON.stringify(params)}`);
    try {
        knex(table).where(parseObject(params).sql_string).delete();
        return {
            code: 0,
            msg: ""
        };
    } catch (error) {
        logger.error(`[delete] ${error}`);
        return {
            code: -1,
            msg: error
        };
    }
}

/**
 *

 * @param {String} table
 * @param {JSON[]|JSON|[]} params where
 * @param {JSON} values new value
 */
function update(table, params, values) {
    if (debug) logger.info(`[update] [${table}] from: ${JSON.stringify(params)}, to: ${JSON.stringify(values)}`);
    try {
        knex(table).where(parseObject(params).sql_string).update(values);
        return {
            code: 0,
            msg: ""
        };
    } catch (error) {
        logger.error(`[update] ${error}`);
        return {
            code: -1,
            msg: error
        };
    }
}

module.exports = {
    getCore: () => require("knex")(knex_options),
    select,
    selectAll,
    selectLast,
    insert,
    delete: _delete,
    update,
    getCount
};
