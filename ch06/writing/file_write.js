/**
 * Created by scottmoon on 6/28/15.
 */

var fs = require('fs');
var path = require('path');
var URLpath = path.dirname(process.mainModule.filename);

var config = {
    maxFiles: 20,
    maxConnections: 15,
    rootPath: "/webroot"
};
var configTxt = JSON.stringify(config);

var options = {
    encoding: 'utf8',
    flag: 'w'
};

console.log(URLpath);


//책에서 나온 것처럼 경로부분은 서버 환경 말고 데스크탑 환경에서 테스트 했는데 안되더라 그래서... 상대 경로 말고 절대경로로 해주니깐 데이터 세이브가 잘되더라...
fs.writeFile(path.join(URLpath, '../data/config.txt'), configTxt, options, function (err) {
    if (err) {
        console.log("Config Write Failed");
    } else {
        console.log("Config Saved");
    }
});