/**
 * Created by scottmoon on 6/28/15.
 */

var fs = require('fs');
var path = require('path');
var URLpath = path.dirname(process.mainModule.filename);
var grains = [
    'wheat',
    'rice',
    'oats'
];

var options = {
    encoding: 'utf8',
    flag: 'w'
};

var fileWriteStream = fs.createWriteStream(path.join(URLpath, '../data/grains.txt'), options);
fileWriteStream.on("close", function () {
    console.log("File Closed");
});
while (grains.length) {
    var data = grains.pop() + " ";
    fileWriteStream.write(data);
    console.log("Wrote: %s", data);
}
fileWriteStream.end();