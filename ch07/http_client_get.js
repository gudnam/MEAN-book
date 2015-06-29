/**
 * Created by scottmoon on 6/30/15.
 */

// http_server_get.js에서 작성한 서버의 응답을 읽기 위한 기본 HTTP 클라이언트 구현부분이다.
// http_client_static.js과 유사하지만 여기서는 경로 정보가 없다.
// 좀더 복잡한 서비스를 운영하기 위해서는 여러개의 라우팅 경로를 지정해 다양한 처리요청을 한다.
var http = require('http');
var options = {
    hostname: 'localhost',
    port: '8080'
};

function handleResponse(response) {
    var serverData = '';
    response.on('data', function (chunk) {
        serverData += chunk;
    });
    response.on('end', function () {
        //현재 페이지의 Status 코드값
        console.log("Response Status: ", response.statusCode);
        //현재 페이지의 header 값
        console.log("Response Headers:", response.headers);
        //서버에 저장된 모든 응답내용 출력
        console.log(serverData);
    });
}

http.request(options, function (response) {
    handleResponse(response);
}).end();