const fs = require("fs");
const requestLib = require("request");

var addr = 'https://v1.hitokoto.cn/?encode=json&charset=utf-8';

function getHitokoto(type) {
    if (!type) { var inSet = '' } else { var inSet = '&type=' + type }
    var GetAddr = addr + inSet;
    try {
        requestLib(GetAddr, function(error, response, body) {
            //console.log(error + "\n" + response + "\n" + body);
            if (!error && response.statusCode == 200) {
                //fs.writeFile('./hitokoko.log', body, { flag: 'a+', encoding: 'utf-8', mode: '0666' }, function(err, fd) { if (err) { return console.error(err); } });
                var x = JSON.parse(body);
                var text = x.hitokoto + '     ---' + x.from;
                //console.log(text);
                //console.log(body);
                //console.log(x);
                return console.log(text);

            }
        });
    } catch (error) {
        fs.writeFile('./error.log', error, { flag: 'a+', encoding: 'utf-8', mode: '0666' }, function(err) { if (err) { return console.error(err); } });
        return error;
    }
}
module.exports = getHitokoto();