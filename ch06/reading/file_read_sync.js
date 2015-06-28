/**
 * Created by scottmoon on 6/29/15.
 */

var fs = require('fs');
fd = fs.openSync('../data/veggie.txt', 'r');
var veggies = "";
do {
    var duf = new Buffer(5);
    buf.fill();

    var bytes = fs.readSync(fd, buf, null, 5);
    console.log("read %dbytes", bytes);

    veggies += buf.toString();
} while (bytes > 0);

fs.closeSync(fd);
console.log("Veggies: " + veggies);