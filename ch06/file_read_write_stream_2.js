/**
 * Created by scottmoon on 6/29/15.
 */

//이 기능은 node.js 0.10 이상부터 가능하다.

var fs = require('fs');
var path = require('path');
var URLpath = path.dirname(process.mainModule.filename);
var dirPath = path.join(URLpath, '/data/sports.txt');

function fileOptions(encoding, flags) {
    var options = {
        encodeing: encoding,
        flags: flags
    }

    return options;
}

var readStream = fs.createReadStream(path.join(URLpath, 'data/sports.txt'), fileOptions('utf8', 'r'));
var writeStream = fs.createWriteStream(path.join(URLpath, 'data/sports_stream2.txt'));

var writable = true;

var doRead = function () {
    var data = readStream.read() + " ";
    writable = writeStream.write(data);
}

readStream.on('readable', function () {
    if (writable) {
        doRead()
    } else {
        // stream buffur가 꽉 찼으니 drain 이벤트가 발생할 때까지 대기
        writeStream.removeAllListeners('drain');
        writeStream.once('drain', doRead)
    }
});

readStream.on('end', function () {
    writeStream.end();
});