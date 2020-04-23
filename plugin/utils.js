/**
 * @param {"POST"|"GET"} method
 * @param {String} path
 * @param {String} base
 * @param {JSON} body
 */
function formatUri(method, base, path, body = {}) {
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

/**
 * 
 * @param {
    "Quote"|"At"   |"AtAll"     |"Face"|
    "Plain"|"Image"|"FlashImage"|"Xml" |
    "Json" |"App"  |"Poke"      } message_type 
 * @param {Array<JSON>} message_content 
 */
function formatMessage(message_type, message_content) {
    message_type = message_type.toUpperCase().substring(0, 1) +
        message_type.toLowerCase().substring(1);
    let params_error = {
        code: -3,
        msg: "miss params"
    };
    switch (message_type) {
        case "Quote": {
            let format = {
                id: Number,
                groupId: Number,
                senderId: Number,
                targetId: Number,
                origin: Number
            };
            for (const key in format) {
                if (!(key in message_content) ||
                    typeof (message_content[key]) !== format[key]
                ) return params_error;
            }
            return {
                type: "Quote",
                ...message_content
            }
            break;
        }
        case "At": {
            if (!(target in message_content) || typeof (message_content.target) !== "number") return params_error;
            return {
                type: "At",
                ...message_content
            }
        }
        case "Atall": {
            // 实际上不需要（
            return {
                type: "AtAll"
            }
            break;
        }
        case "Face": {
            if (!(faceId in message_content || typeof (message_content.faceId) !== "number") ||
                !(name in message_content || typeof (message_content.name) !== "string")
            ) return params_error;
            return {
                type: "Face",
                ...message_content
            };
            break;
        }
        case "Plain": {
            if (!(text in message_content) || typeof (message_content.text) !== "string") return params_error;
            return {
                type: "Plain",
                ...message_content
            }
        }
        case "Image": {
            if (!(imageId in message_content && typeof (message_content.imageId) !== "string") ||
                !(url in message_content && typeof (message_content.url) !== "string") ||
                !(path in message_content && typeof (message_content.path) !== "string")
            ) return params_error;
            return {
                type: "Image",
                ...message_content
            }
        }
        case "FlashImage": {
            if (!(imageId in message_content && typeof (message_content.imageId) !== "string") ||
                !(url in message_content && typeof (message_content.url) !== "string") ||
                !(path in message_content && typeof (message_content.path) !== "string")
            ) return params_error;
            return {
                type: "FlashImage",
                ...message_content
            }
        }
        case "Xml": {
            if (!(xml in message_content) || typeof (message_content.xml) !== "string") return params_error;
            return {
                type: "Xml",
                ...message_content
            }
        }
        case "Json": {
            if (!(json in message_content) || typeof (message_content.json) !== "string") return params_error;
            return {
                type: "Json",
                ...message_content
            }
        }
        case "App": {
            if (!(content in message_content) || typeof (message_content.content) !== "string") return params_error;
            return {
                type: "App",
                ...message_content
            }
        }
        case "Poke": {
            if (!(name in message_content) || typeof (message_content.name) !== "string") return params_error;
            return {
                type: "Poke",
                ...message_content
            }
        }
        default: {
            return {
                code: -2,
                msg: "no such type call " + message_type
            }
            break;
        }
    }
}
module.exports = {
    formatUri,
    parseObject,
    formatMessage
}