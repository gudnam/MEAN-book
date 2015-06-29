/**
 * Created by scottmoon on 6/30/15.
 */


var http = require('http');
//2.웹서버에서 정적 파일을 가져오는 기본 웹 클라이언트의 구현부분

// 요청을 위한 옵션 설정
var options = {
    hostname: 'localhost',
    port: '8080',
    path: '/hello.html'
};

function handleResponse(response) {
    var serverData = '';
    response.on('data', function (chunk) {

        serverData += chunk;
    });
    response.on('end', function () {
        console.log(serverData);
    });
}

// 클라이언트 초기화
http.request(options, function (response) {
    handleResponse(response);
}).end();