/**
 * Created by scottmoon on 6/30/15.
 */

var net = require('net');

// net.createServer()으로 소켓 서버를 생성한다. (예제 테스트때문에 임시로 생성.)
var server = net.createServer(function (socket) {
    socket.write('Echo server\r\n');
    socket.pipe(socket);
});

// 서버의 리스닝 포트와 호스트는 클라이언트의 호스티와 동일해야한다.
server.listen(8107, 'localhost');

function getConnection(connName) {
    var client = net.connect({port: 8107, host: 'localhost'}, function () {
        console.log(connName + ' Connected: ');
        console.log(' local = %s:%s', this.localAddress, this.remotePort);
        this.setTimeout(500);
        this.setEncoding('utf8');

        this.on('data', function (data) {
            console.log(connName + " From Server: " + data.toString());
            this.end();
        });
        this.on('end', function () {
            console.log(connName + ' Client disconnected');
        });
        this.on('error', function () {
            console.log('Socket Error: ' + JSON.stringify(err));
        });
        this.on('timeout', function () {
            console.log('Socket Timed Out');
        });
        this.on('close', function () {
            console.log('Socket Closed');
        });
    });
    return client;
}

function writeData(socket, data) {
    var success = !socket.write(data);
    if (!success) {
        (function (socket, data) {
            socket.once('drain', function () {
                writeData(socket, data);
            });
        })(socket, data);
    }
}

var Dwarves = getConnection("Dwarves");
var Elves = getConnection("Elves");
var Hobbits = getConnection("Hobbits");
writeData(Dwarves, "More Axes");
writeData(Elves, "More Arrows");
writeData(Hobbits, "More Pipe Weed");