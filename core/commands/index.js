const logger = require("@core/libs/logger").getLogger("core");
const CommandPath = require("require-all")({
    dirname: __dirname + "/",
    filter: /(.+command)\.js$/,
    map: name => name.replace(".command", "")
});

let commands = new Map();
let docs = new Map();
let formats = new Map();
let help_str = "====[菜单]====\n.help [模块名] - 获取帮助\n";

function addCommand(name, obj) {
    for (const k in obj) {
        let v = obj[k];
        if (v instanceof RegExp) {
            addFormats(k, v, name);
        } else if (typeof v === "object") {
            addCommand(k, v);
        } else if (typeof v === "function") {
            commands.set(k, v);
        } else if (typeof v === "string") {
            addDocs(k, v, name);
        } else {
            throw new Error(k + " 定义出错，类型必须为 function 或 object");
        }
    }
}

function addDocs(k, v, name = "") {
    if (name.length === 0) name = k;
    switch (k) {
        case "docs":
            docs.set(name, v);
            break;
        case "desc":
            help_str += `.${name} - ${v}\n`;
            break;
        default:
            break;
    }
}

function addFormats(k, v, name = "") {
    if (name.length === 0) name = k;
    formats.set(name, v);
}

for (const k in CommandPath) {
    let v = CommandPath[k];
    if (commands.has(k)) throw new Error("已有相同命令: " + k);
    let type = typeof v;
    if (v instanceof RegExp) {
        addFormats(k, v);
    } else if (type === "object") {
        addCommand(k, v);
    } else if (type === "function") {
        commands.set(k, v);
    } else if (type === "string") {
        addDocs(k, v);
    } else {
        throw new Error(k + " 定义出错，类型必须为 function 或 object");
    }
}

commands.set("help", (name = []) => {
    if (name.length === 0) return help_str;
    return docs.get(name[0]);
});

formats.set("help", /help.*/);

logger.debug("commandPath: ", CommandPath);
logger.debug("commands: ", commands);
logger.debug("formats: ", formats);

module.exports = {
    commands,
    formats
};
