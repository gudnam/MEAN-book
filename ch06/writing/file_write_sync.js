/**
 * Created by scottmoon on 6/28/15.
 */

var fs = require('fs');
var veggieTray = ['carrots', 'calery', 'olives'];
fd = fs.openSync('../data/veggie.txt', 'w');
while (veggieTray.length) {
    veggie = veggieTray.pop() + " ";
    var bytes = fs.writeSync(fd, veggie, null, null);
    console.log('wrote %s %dbytes', veggie, bytes);

}
fs.closeSync(fd);