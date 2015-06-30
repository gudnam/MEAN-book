/**
 * Created by scottmoon on 6/30/15.
 */

var http = require('http');

//createServer()로 서버생성
http.createServer(function (req, res) {
    var jsonData = "";
    //request가 데이터를 읽을 시점에 jsondata를 읽는다.
    req.on('data', function (chunk) {
        jsonData += chunk;
    });
    //request가  데이터를 읽은 후에, jsondata를 JSON 객체로 변환하고 message와 occupation속성을 가진 새로운 객체를 만든다.
    //request에서 새로운 객체를 만든 후에 resObject의 JSON형식의 객체를 넣는다.
    req.on('end', function () {
        var reqObject = JSON.parse(jsonData);
        var resObject = {
            message: "Hello " + reqObject.name,
            question: "Are you a good " + reqObject.occupation + "?"
        };
        res.writeHead(200);
        //마지막으로 response가 마무리되는 시점에 request에서 받아온 데이터를 콘솔상에 표시를 하게 된다.
        res.end(JSON.stringify(resObject));
    });
    //서버 포트값 8080
}).listen(8080);