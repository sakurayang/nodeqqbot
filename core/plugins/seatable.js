const fs = require("fs");
const path = require("path");
const logger = require("../libs/logger").getLogger("seatable");
const config = require("../../config");
const Axios = require("axios").default;

let tokens = new Map();

const axios = Axios.create({
    baseURL: config.seatable.server,
    timeout: 3600,
    headers: {
        Accept: "application/json; charset=utf-8",
        Authorization: `Token ${config.seatable.token}`
    }
});

const server = Axios.create({
    baseURL: config.seatable.server + "/dtable-server",
    timeout: 3600,
    headers: {
        Accept: "application/json; charset=utf-8"
    }
});

if (config.debug) {
    require("axios-debug-log")({
        request: function (debug, config) {
            debug("Request with " + config.headers["content-type"]);
        },
        response: function (debug, response) {
            debug("Response with " + response.headers["content-type"], "from " + response.config.url);
        },
        error: function (debug, error) {
            // Read https://www.npmjs.com/package/axios#handling-errors for more info
            debug("Boom", error);
        }
    });
}

/**
 *
 * @param {string} workspaceID
 * @param {string} dtableName
 * @returns {{access_token:string,dtable_uuid:string}}
 */
async function getAccessToken(workspaceID, dtableName) {
    let url_encoded_name = encodeURIComponent(dtableName);
    let res = await axios.get(`/api/v2.1/workspace/${workspaceID}/dtable/${url_encoded_name}/access-token/`);
    return res.data;
}

/**
 * @async
 * @returns {{access_token:String,access_token_date:Number,uuid:String}}
 */
async function init(workspaceID, dtableName, table_name = "Table1") {
    let info = await getAccessToken(workspaceID, dtableName);
    tokens.set(info.access_token, Date.now());
    return {
        access_token: info.access_token,
        access_token_date: Date.now(),
        uuid: info.dtable_uuid,
        table_name
    };
}

function checkAccessToken(access_token) {
    let access_token_date = tokens.get(access_token);
    return access_token_date + 3 * 24 * 3600 * 1000 <= Date.now();
}

/**
 * @async
 * @returns {JSON}
 */
async function getTableMetadata(uuid, access_token) {
    return (
        await server.get(`/api/v1/dtables/${uuid}/metadata/`, {
            headers: {Authorization: `Token ${access_token}`}
        })
    ).data.metadata;
}

// /**
//  * @returns {JSON}
//  */
// function getTableColumns(metadata, tableName) {
//     let table = metadata.table[this.table_map.get(this.tableName)];
//     return table.columns;
// }

/**
 * @async
 * @returns {JSON}
 */
async function getTableRows(access_token, table_name) {
    if (checkAccessToken(access_token)) return {code: -102};
    return JSON.parse(
        (
            await server.get(` /api/v1/dtables/${this.uuid}/rows/`, {
                headers: {Authorization: `Token ${access_token}`},
                params: {table_name}
            })
        ).data.rows
    );
}

/**
 *
 * @param {string} access_token
 * @param {string} table_name
 * @param {Number} id row number id
 * @returns {String} row uuid
 */
async function id2rowId(access_token, table_name, id) {
    if (checkAccessToken(access_token)) return {code: -102};
    id = id < 0 ? 0 : id;
    let rows = await getTableRows(access_token, table_name);
    return rows[id - 1]["_id"];
}

/**
 *
 * @param {Number} id
 * @param {JSON} row
 */
async function insert(access_token, uuid, table_name, id, row) {
    if (checkAccessToken(access_token)) return {code: -102};
    let row_id = id2rowId(table_name, id);
    let res = await server.post(
        `/api/v1/dtables/${uuid}/rows/`,
        {
            row,
            table_name,
            anchor_row_id: row_id,
            row_insert_position: "insert_below"
        },
        {headers: {Authorization: `Token ${access_token}`}}
    );
    return res.status > 200 ? new Error(res.statusText) : res.data;
}

/**
 * @async
 * @param {{key:String}[]|{key:String}} _rows
 * @returns {JSON}
 */
async function append(access_token, uuid, table_name, _rows) {
    if (checkAccessToken(access_token)) return {code: -102};
    let rows = _rows instanceof Array ? _rows : [_rows];
    let res = await server.post(
        `/api/v1/dtables/${uuid}/batch-append-rows/`,
        {table_name: table_name, rows},
        {headers: {Authorization: `Token ${access_token}`}}
    );
    return res.status > 200 ? new Error(res.statusText) : res.data;
}

/**
 * @async
 * @param {String|Number} row_id
 * @returns {JSON}
 */
async function remove(access_token, uuid, table_name, id) {
    if (checkAccessToken(access_token)) return {code: -102};
    let row_id = id2rowId(id);
    let res = await server.delete(`/api/v1/dtables/${uuid}/rows/`, {
        headers: {Authorization: `Token ${access_token}`},
        params: {table_name: table_name, row_id}
    });
    return res.status > 200 ? new Error(res.statusText) : res.data;
}

/**
 *
 * @param {Number} id
 * @param {JSON} row
 */
async function update(access_token, uuid, table_name, id, row) {
    if (checkAccessToken(access_token)) return {code: -102};
    let row_id = this.id2rowId(id);
    let res = await server.put(
        `/api/v1/dtables/${uuid}/rows/`,
        {
            table_name,
            row,
            row_id
        },
        {headers: {Authorization: `Token ${access_token}`}}
    );
    return res.data.success;
}

module.exports = {
    getAccessToken,
    init,
    checkAccessToken,
    getTableMetadata,
    getTableRows,
    id2rowId,
    insert,
    append,
    remove,
    update
};
