const path = require("path");
const fs = require("fs");
const config = require("@root/config");
const global_path = config.path.data;
const logger = require("./logger").getLogger("file");

/**
 * @param {String} file filename
 * @return {JSON}
 */
async function File2Json(file) {
    let data = await fs.readFileSync(path.join(global_path, file), {
        encoding: "utf-8",
        flag: "r"
    });
    data = JSON.parse(data);
    logger.debug(`${file} content`, data);
    return data;
}

/**
 * @param {String} file filename
 * @param {JSON} data
 * @return {JSON}
 */
function Json2File(file, data) {
    logger.debug(`write to file: `, data);
    fs.writeFile(
        path.join(global_path, file),
        JSON.stringify(data),
        {
            encoding: "utf-8",
            flag: "w"
        },
        err => logger.error(err)
    );
}

module.exports = {
    File2Json,
    Json2File
};
