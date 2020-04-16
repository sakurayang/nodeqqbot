/**
 * @param {"POST"|"GET"} method
 * @param {String} path
 * @param {String} base
 * @param {JSON} body
 */
function getUri(method, base, path, body = {}) {
    return {
        method,
        uri: new URL(path, base),
        json: true,
        ...body,
    };
}

/**
 * @param {JSON} obj
 */
function parseObject(obj) {
    let keys = Object.keys(obj);
    let values = Object.values(obj);
    let transfrom = [];
    let isArray = Array.isArray(obj);

    for (const key in obj) {
        isArray ? transfrom[key] = obj[key] : transfrom.push(`${key}=${obj[key]}`);
    }
    return {
        keys,
        values,
        length: keys.length,
        transfrom,
        sql_string: transfrom.toString().replace(",", " and ")
    };
}
module.exports = {
    getUri,
    parseObject,
    logger: require("./logger")
}