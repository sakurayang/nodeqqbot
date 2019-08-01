var http = require("http");
var requestLib = require("request");
var app = http.createServer();

var address = "http://localhost:5700/send_group_msg?";

var group = new Array();

group = ["190674121", "118047250", "600132151", "151751140", "614751169", "634725864"];

function getUrl(msg) {
    var url = new Array();
    for (let i = 0, len = group.length; i < len; i++) {
        url[i] = address + "group_id=" + group[i] + "&message=" + encodeURIComponent(msg);
    }
    return url;
}

app.on('request', function(req, res) {
    var post = '';
    req.on('data', function(chunk) {
        post += chunk;
    });

    req.on('end', function() {
        res.writeHead(200, { 'Content-type': 'text/html' });
        var dataDec = post;
        console.log(dataDec);
        if (dataDec != (null | undefined | '')) {
            var content = JSON.parse(dataDec);
            var msg = content.msg;
            var urls = getUrl(msg);
            console.log(msg);
            for (var i = 0, len = urls.length; i < len; i++) {
                try {
                    //requestLib(urls[i]);
                    console.log(urls[i])
                } catch (err) {
                    console.error(error);
                }

            }
            res.write("200 OK");
            res.end();
        } else {
            res.writeHead(403, { 'Content-typr': 'text/html' });
            res.write("error");
            res.end()
        }

    });
});
app.listen(9999, '0.0.0.0');