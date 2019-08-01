const http = require("http");
const app = http.createServer();
const buffer = require('buffer');
debug = 1
async function getEncode(chunk) {
    let encode = "",
        re = /{|"|'|:|}/;
    key = chunk.split(/:|,/);
    // for (let i = 0, len = chunk.length; i < len; i++) {
    //     let char = chunk[i];


    //     (re.test(char)) ?
    //     (char == '{') ?
    //     encode += `${char}"`:
    //         (char == ':') ?
    //         encode += `"${char}"` :
    //         (char == '}') ?
    //         encode += `"${char}` :
    //         (char == '"' || char == "'") ?
    //         encode += char : false:
    //         encode += encodeURIComponent(char);
    // }
}


app.on('request', (req, res) => {
    req.on('data', chunk => {
        console.log(chunk);
        console.log(chunk.toString('utf8'));
        chunk = buffer.transcode(chunk, 'utf8', 'ucs2');
        console.log(chunk.toString('ucs2'));

        // getEncode(chunk).then(res => {
        //     //json = JSON.parse(String(res.toString('ucs2')));
        //     debug ? console.log(json) : false
        // }).catch((rej) => {
        //     console.log(new Error(rej));
        // });
    });
    req.on('end', () => {
        res.writeHead(200);
        res.end();
    })
})

app.listen(9020, '0.0.0.0')