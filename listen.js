const http = require("http");
const requestLib = require("request");

var grep_command = /^![\Ss]*/;
var grep_at = /[\S\s]*\[CQ:at,qq=2782255175\][\S\s]*/;
var app = http.createServer();

function getReturnText(command) {
    switch (command) {
        case "Q":
            return "花Q!";
            break;

        default:
            return "命令未定义";
            break;
    }
}

app.on('request', function(req, res) {
    var data = '';
    req.on('data', function(chunk) {
        data += chunk;
        post = JSON.parse(data);
    });

    req.on('end', function() {
        res.writeHead(200, { 'Content-Type': 'application/json' });

        var msg = post.message;
        var sender = post.user_id;
        var type = post.post_type;
        //console.log(type);
        if (type == "message") {
            //console.log(post);
            console.log(msg);
            if (grep_command.test(msg)) {
                var command = msg.substr(1);
                var return_text = getRuturnText(command);
                //var sender = post.sender.card;
                //console.log(sender+": "+msg+"\n");

                console.log(command);
                console.log(return_text);
                res.end();
            } else if (grep_at.test(msg)) {
                if (sender != 1304274443) {
                    var reply = '{"reply": "你们烦不烦啊，说了不要at了，走开行不行，我讨厌你。还有，只有主人才能碰我，你们走开。","ban":true,"ban_duration":1440}'
                } else { var reply = '{ "reply": "主人我有好好工作的说~~" }' }
                res.write(reply);
                res.end();
            }

        } else if (type == "notice") {
            res.end();

        } else if (type == "request") {
            res.end();
        } else { res.end(); }

        //console.log(raw_msg);
        //console.log(msg);
        //console.log(post);

    });
});
app.listen(18989, '0.0.0.0');