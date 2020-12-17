const axios = require("axios");
const ADDRESS = "https://hiyoko.sonoj.net/f/avtapi/schedule/fetch_curr";

function getDate(unix) {
    if (!unix || (typeof (unix) != "number" && isNaN(unix))) return false;
    let date = new Date(unix);
    return date.getFullYear() +
        "-" + date.getMonth().toString().padStart(2, "0") +
        "-" + date.getDate().toString().padStart(2, "0") +
        " " + date.getHours().toString().padStart(2, "0") +
        ":" + date.getMinutes().toString().padStart(2, "0") +
        ":00";
}
async function getInfo(unix = Date.now()) {
    unix = (!unix || (typeof (unix) != "number" && isNaN(unix))) ? Date.now() : unix;
    let start = getDate(unix);
    let end = getDate(unix + 25 * 60 * 60 * 1000);
    let options = {
        "filter_state": "{\"open\": false,\"selectedGroups\": \"\",\"following\": false,\"text\": \"\"}",
        "start": "2019-11-29 18:54:00",
        "end": "2019-11-30 18:54:00"
    }
    console.log(options);
    let data = await axios.post(ADDRESS, options);
    console.log(data);
    console.log(start, end);
}
getInfo();