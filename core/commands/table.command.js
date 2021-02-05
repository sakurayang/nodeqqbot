const {Json2File, File2Json} = require("../libs/json");
const config = require("../../config");
const table = require("../plugins/seatable");
const db = require("../libs/db");
const logger = require("../libs/logger").getLogger("plugin");
const storage = require("node-global-storage");

const help = "";

(async () => {
    let isTableExist = await db.getCore().schema.hasTable("id2table");
    if (!isTableExist) {
        await db.getCore().schema.createTable("id2table", table => {
            table.bigIncrements("id");
            table.bigInteger("group_id").notNullable();
            table.string("workspace").notNullable();
            table.string("dtable_name").notNullable();
            table.string("table_name").notNullable();
            table.string("table_uuid").notNullable();
            table.index("id");
            table.index("group_id");
        });
    }
})();

async function setData(k, v) {
    let data = (await File2Json("storage.json")) || [];
    if (data.length === 0) data.push({[k]: v});
    for (const group of data) {
        if (Object.keys(group)[0] === String(k)) data[data.indexOf(group)] = {[k]: v};
        else data.push({[k]: v});
    }
    Json2File("storage.json", data);
    return storage.set(k, v);
}

/**
 *
 * @param {Number} group_id
 * @param {String} workspaceID
 * @param {String} dtableName
 * @param {String} table_name
 */
async function link(group_id, workspaceID, dtableName, table_name = "Table1") {
    let res = await db.select("id2table", `group_id=${group_id}`);
    if (res.code !== 0) {
        logger.error("[table]", res.msg);
        return "Error";
    }
    if (res.result.length === 0) {
        let t = await table.init(workspaceID, dtableName, table_name);
        if (!storage.isSet(group_id)) setData(group_id, t);
        let uuid = t.uuid || "";
        let access_token = t.access_token;
        await db.insert("id2table", {
            group_id,
            table_uuid: uuid,
            workspace: workspaceID,
            dtable_name: dtableName,
            table_name
        });
        return "sit back amd wait";
    } else if (!storage.isSet(group_id)) {
        let t = await table.init(workspaceID, dtableName, table_name);
        await setData(group_id, t);
        return "sit back and wait";
    } else if (res.result.length !== 0 && storage.isSet(group_id)) {
        return "already init";
    } else {
        return "Error";
    }
}

/**
 *
 * @param {String|Number} group_id
 * @param {JSON} data
 */
async function append(group_id, data) {
    group_id = String(group_id);
    if (!storage.isSet(group_id)) return "please link first";
    let t = storage.get(group_id);
    logger.debug(t);
    let res = await table.append(t.access_token, t.uuid, t.table_name, [data]);
    logger.debug(res);
    return `插入${res.inserted_row_count}行`;
}

/**
 *
 * @param {Array} params
 * @param {Object} sender
 * @param {Object} msg
 */
async function t(params, sender, msg) {
    if (params.length === 0) return help;
    let operation = params[0];
    let group_id = msg.group_id;
    let role = sender.role;
    let isAdmin = ["admin", "owner"].indexOf(role) === -1;
    switch (operation) {
        case "init":
        case "link": {
            if (params.length < 3) return "need more params";
            if (isAdmin) return "only owner or admin can do";
            let [workspaceID, dtableName, ...temp] = params.splice(1);
            let tableName = temp.length === 0 ? "Table1" : temp[0];
            await link(group_id, workspaceID, dtableName, tableName);
            return "sit back and wait";
        }
        case "add": {
            if (params.length < 2) return "need more params";
            let data = {};
            for (const pair of params.slice(1)) {
                let [key, value] = pair.split(/:|：/);
                data[key] = value;
            }
            let res = await append(group_id, data);
            return res;
        }
        case "help":
        default:
            return help;
            break;
    }
}

module.exports = {
    table: {
        desc: "table",
        docs: "table",
        table: t,
        format: /table\s*/
    }
};
