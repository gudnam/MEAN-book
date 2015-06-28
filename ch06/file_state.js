/**
 * Created by scottmoon on 6/29/15.
 */

var fs = require('fs');
fs.stat('file_state.js', function (err, stats) {
    if (!err) {
        console.log('stats: ' + JSON.stringify(stats, null, ''));
        console.log(stats.isFile() ? "Is a File" : "Is not a File");
        console.log(stats.isDirectory() ? "Is a Folder" : "Is not a Folder");
        console.log(stats.isSocket() ? "Is a Socket" : "Is not a Socket");
        stats.isDirectory();
        stats.isBlockDevice();
        stats.isCharacterDevice();
        //Stats.isSymbolicLink(); // only 1stat
        stats.isFIFO();
        stats.isSocket();
    }
});