const hmr = require("node-hmr");
let db;
let listener;
let logger;
let utils;
hmr(() => {
    console.log("reload");
    db = require("./db");
    listener = require("./listener");
    logger = require("./logger");
    utils = require("./utils");
}, {
    watchDir: "./"
});
module.exports = {
    db,
    listener,
    logger,
    utils
}