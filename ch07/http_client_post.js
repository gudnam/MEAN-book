/**
 * Created by scottmoon on 6/30/15.
 */

var http = require('http');
// 2.서버에 요청사항
var options = {
    host: '127.0.0.1',
    path: '/',
    port: '8080',
    method: 'POST'
};

//3. 서버가 응답을 받으면 다음 함수가 시작이 된다.
function readJSONResponse(response) {
    var responseData = "";
    // 4.response 핸들러가 JSON의 객체를 읽는다.
    response.on('data', function (chunk) {
        responseData += chunk;
    });

    // 6.response 핸들러가 요청 완료되는 시점에 JSON객체로 변환하고 원시 응답과 메세지, 질문형태로 출력한다.
    response.on('end', function () {
        var dataObj = JSON.parse(responseData);
        console.log("Raw Respose: " + responseData);
        console.log("Message: " + dataObj.message);
        console.log("Question: " + dataObj.question);
    });
}

// 1.서버에 접근 요청
var req = http.request(options, readJSONResponse);
// 5.서버에 JSON 문자열 기록
req.write('{"name":"Bilbo", "occupation":"Burglar"}');
// 7.서버의 요청이 끝나면 request는 종료한다.
req.end();