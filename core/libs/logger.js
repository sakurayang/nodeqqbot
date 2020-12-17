const config = require("@root/config");
const log4js = require("log4js");
const path = require("path");

const debug_appender = {
    out: {
        type: "stdout"
    },
    err: {
        type: "stderr",
        layout: {
            type: "coloured"
        }
    }
};

const debug_categories = {
    out: {
        appenders: ["out"],
        level: "all"
    }
};

const getPath = filename => path.join(config.path.logs, `${new Date().toISOString().substring(0, 10)}${filename}.log`);

log4js.configure({
    appenders: {
        all: {
            type: "file",
            filename: getPath(""),
            compress: true
        },
        http: {
            type: "file",
            filename: getPath("_http"),
            compress: true
        },
        database: {
            type: "file",
            filename: getPath("_database"),
            compress: true
        },
        ...(config.debug ? debug_appender : {})
    },
    categories: {
        default: {
            appenders: ["all", ...(config.debug ? ["out"] : [])],
            level: "debug"
        },
        core: {
            appenders: ["all", ...(config.debug ? ["out"] : [])],
            level: "debug"
        },
        http: {
            appenders: ["http", ...(config.debug ? ["out"] : [])],
            level: "debug"
        },
        database: {
            appenders: ["database", ...(config.debug ? ["out"] : [])],
            level: "debug"
        },
        ...(config.debug ? debug_categories : {})
    }
});

module.exports = log4js;
