/**
 * Created by scottmoon on 6/29/15.
 */


var fs = require('fs');
var path = require('path');
var URLpath = path.dirname(process.mainModule.filename);
var sports = [
    'soccer',
    'baseball',
    'basket ball',
    'hockey',
    'boxing'
];

var dirPath = path.join(URLpath, 'data/sports.txt');

function fileOptions(encoding, flags) {
    var options = {
        encodeing: encoding,
        flags: flags
    }

    return options;
}

var fileReadStream;
var fileWriteStream;
//var fileWriteStream = fs.createWriteStream(path.join(URLpath, 'data/sports.txt'), write_options);
fileWriteStream = fs.createWriteStream(dirPath, fileOptions('utf8', 'w'));
fileWriteStream.on("close", function () {
    console.log("Write File Closed");
    fileReadStream = fs.createReadStream(dirPath, fileOptions('utf8', 'r'));
    fileReadStream.on('data', function (chunk) {
        console.log('Sports: %s', chunk);
        console.log('Read %d bytes of data.', chunk.length);
    });
    fileReadStream.on("close", function () {
        console.log("File closed");
    });
});
while (sports.length) {
    var data = sports.pop() + " ";
    fileWriteStream.write(data);
    console.log("Wrote: %s", data);
}
fileWriteStream.end();


