/**
 * Created by scottmoon on 7/1/15.
 */

var child_process = require('child_process');

var options = {
    env: {user: 'Brad'},
    encoding: 'utf8'
};

function makeChild() {
    // fork()함수로 chef.js 파일 요청
    // 부모가 자식에게 'message'요청
    var child = child_process.fork('chef.js', [], options);
    child.on('message', function (message) {
        console.log('Served: ' + message);
    })
    return child;
}

function sendCommand(child, command) {
    console.log('Requesting: ' + command);
    child.send({cmd: command});
}

var child1 = makeChild();
var child2 = makeChild();
var child3 = makeChild();

sendCommand(child1, "makeBreakfast");
sendCommand(child2, "makeLunch");
sendCommand(child3, "makeDinner");