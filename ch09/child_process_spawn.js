/**
 * Created by scottmoon on 7/1/15.
 */

var spawn = require('child_process').spawn;

var options = {
    env: {user: 'brad'},
    detached: false,
    stdio: ['pipe', 'pipe', 'pipe']
};

var child = spawn('netstat', ['-m']);

child.stdout.on('data', function (data) {
    console.log(data.toString());
});

child.stdout.on('exit', function (code) {
    console.log('Child exited with code', code);
});
