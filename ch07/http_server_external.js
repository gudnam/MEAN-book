/**
 * Created by scottmoon on 6/30/15.
 */

var http = require('http');
var url = require('url');
var qstring = require('querystring');


//0. createServer()로 서버 생성
http.createServer(function (req, res) {
    console.log(req.method);
    //1-1 POST 방식으로 접근할시
    if (req.method == "POST") {
        var reqData = '';
        req.on('data', function (chunk) {
            reqData += chunk;
            //console.log('buffer: %s', reqData.toString());
        });
        req.on('end', function () {
            var postParams = qstring.parse(reqData);
            //console.log('postParams:', postParams);
            var rep_city = postParams.city.replace(' ', '+');
            //console.log("Replace Api City: %s", rep_city.toString());
            getWeather(rep_city, res);
        });
    }
    //2-1 GET방식으로 접근시
    else if (req.method == "GET") {
        sendResponse(null, res);
    }
}).listen(8080);

//1-2. api.openweathermap.org의 클라이언트 연결 요청
function getWeather(city, res) {
    var options = {
        host: 'api.openweathermap.org',
        path: '/data/2.5/weather?q=' + city
    };

    http.request(options, function (weatherResponse) {
        parseWeather(weatherResponse, res);
    }).end();
}


//1-3. openweathermap의 데이터를 읽어서 sendResponse()로 데이터를 전달
function parseWeather(weatherResponse, res) {
    var weatherData = '';
    weatherResponse.on('data', function (chunk) {
        weatherData += chunk;
    });
    weatherResponse.on('end', function () {
        sendResponse(weatherData, res);
    });
}

//1-4. 데이터를 가공하여 브라우저에 출력한다.
//2-1. 처음 서버에 출력될 경우나, 데이터의 값이 없는 경우에는 데이터 없이 기본 폼을 출력한다.
function sendResponse(weatherData, res) {
    var page = '<html><head><title>External Example</title></head>' +
        '<body>' +
        '<form method="post">' +
        'City : <input name="city"><br>' +
        '<input type="submit" value="Get Weather">' +
        '</form>';

    if (weatherData) {
        page += '<h1>Weather Info</h1><p>' + weatherData + '</p>';
    }
    page += '</body></html>';
    res.end(page);
}
