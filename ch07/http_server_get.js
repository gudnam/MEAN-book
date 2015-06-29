/**
 * Created by scottmoon on 6/30/15.
 */

// 간단한 HTTP 파일을 동적으로 생성해 응답하는 기본적 형태의 동적 웹서버의 구현내용이다.
// 헤더를 보내고 응답을 작성 후 연속적인 write()요청을 통해서 데이터를 전송한다.

var http = require('http');
var message = [
    'Hello World',
    'From a basic Node.js server',
    'Take Lunck'
];

//createSever()를 사용해 서버를 생성한다.
http.createServer(function (req, res) {
    //content-type의 헤더를 설정
    //응답 코드를 200과 함께 헤더에 보낸다.
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.write('<html><head><title>Simple HTTP Server</title></head>');
    res.write('<body>');
    //Array에 작성된 배열 값들을 for문을 통해 하나씩 호촐하고 res에 기록을 한다.
    for (var idx in message) {
        res.write('\n<h1>' + message[idx] + '</h1>');
    }
    //응답을 마무리하는 시점에 마지막부분을 html-tag의 밑부분으로 마무리 짓는다.
    res.end('\n</body></html>');
    //8080포트로 수신한다.
}).listen(8080);

//var http = require('http');
//var options = {
//    hostname : 'localhost',
//    port : '8080'
//};
//
//function handleResponse(response) {
//    var serverData = '';
//    response.on('data', function(chunk){
//        serverData += chunk;
//    });
//    response.on('end', function () {
//        console.log( "Response Status: " + response.statusCode );
//        console.log( "Response Headers: " + response.headers );
//        console.log(serverData);
//    });
//}
//
//http.request(options, function (response) {
//    handleResponse(response);
//}).end();
