/**
 * Created by scottmoon on 6/29/15.
 */
var fs = require('fs');
var path = require('path');
var URLpath = path.dirname(process.mainModule.filename);

function readFruit(fd, fruits) {
    var buf = new Buffer(5);
    buf.fill();
    //fs.read(fd, buf, 0, 5, null, function(err, bytes, data){
    fs.read(fd, buf, 0, 5, null, function (err, bytes, data) {
        if (bytes > 0) {
            console.log("read %dbytes", bytes);
            fruits += data;
            readFruit(fd, fruits);
        } else {
            fs.close(fd);
            console.log("Fruits: %s", fruits);
        }
    });
}
fs.open(path.join(URLpath, '../data/fruit.txt'), 'r', function (err, fd) {
    if (err) {
        console.log("Open Failed");
    } else {
        readFruit(fd, "");
    }
});
