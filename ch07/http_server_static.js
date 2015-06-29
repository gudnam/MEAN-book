/**
 * Created by scottmoon on 6/30/15.
 */
var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html/";

//1. 웹서버를 생성 및 구현
//HTTP 서버 생성
http.createServer(function (req, res) {
    //요청 이벤트 핸들의 대한 정의
    var urlObj = url.parse(req.url, true, false);
    fs.readFile(ROOT_DIR + urlObj.pathname, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
    //리스너를 통해서 port를 8080으로 호출
}).listen(8080);

