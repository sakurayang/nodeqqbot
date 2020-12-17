const path = require("path");

const mysql = {
    client: "mysql",
    connection: {
        host: "localhost:3306",
        user: "bot",
        password: "password",
        database: "bot"
    }
};

const sqlite = {
    client: "sqlite",
    connection: async () => ({
        filename: path.resolve("./data/db.db")
    })
};

const web = {
    enable: true,
    port: 5701
};

const bot = {
    qq: {
        apiHost: "localhost:1701",
        qq: 12344567890
    },
    telegram: {
        token: "tokenhere",
        apiHost: "https://api.telegram.org/bot",
        debug: false
    }
};

module.exports = {
    debug: process.env.NODE_ENV === "development",
    web,
    bot,
    path: {
        data: "./data",
        logs: "./data/logs"
    },
    database: sqlite
};
