/**
 * Created by scottmoon on 6/29/15.
 */

var fs = require('fs');
var fruitBowl = ['apple', 'orange', 'banana', 'grapes'];
function writeFruits(fd) {

    if (fruitBowl.length) {
        var fruit = fruitBowl.pop() + " ";

        fs.write(fd, fruit, null, null, function (err, bytes) {
            if (err) {
                console.log("File Write Failed");
            } else {
                console.log("Wrote: %s %dbytes", fruit, bytes);
                writeFruits(fd);
            }
        });
    } else {
        fs.close(fd);
    }
}
fs.open('../data/fruit.txt', 'w', function (err, fd) {
    writeFruits(fd);
});