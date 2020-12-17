const axios = require("axios").default;
const config = require("@root/config");

const axios_config = {
    baseURL: config.bot.apiHost,
    timeout: 3600
};

const instance = axios.create(axios_config);

module.exports = instance;
