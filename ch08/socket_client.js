/**
 * Created by scottmoon on 6/30/15.
 */


/*
 여기서는 서버를 예시로 생성하여 소켓을 넣었다.
 한 서버에 소캣3개를 생성하여 각각의 소캣이름과 랜덤포트 번호를 부여받아 생성하였다.
 각각의 소캣의 열려있는 상태로 서버와 동시에 통신하고 있다.
 */
var net = require('net');


var options = {
    port: 8107,
    host: 'localhost'
};

//// net.createServer()으로 소켓 서버를 생성한다. (예제 테스트때문에 임시로 생성.)
//var server = net.createServer(function (client) {
//    //각각의 클라이언트를 server와 연결해준다.
//    client.pipe(client)
//});
//
//// 8107포트로 연결 수신
//server.listen(8107, function () {
//    console.log('Server listening for connections');
//});

function getConnection(connName) {
    // options는 서버와 연결할 포트를 지정하는곳이다.
    // 예제에서는 한서버의 옵션을 두기때문에 options를 전역으로 두었다.
    var client = net.connect(options, function () {
        console.log(connName + ' Connected: ');
        console.log('   local = %s:%s', this.localAddress, this.localPort);
        console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);
        this.setTimeout(500);
        this.setEncoding('utf8');

        this.on('data', function (data) {
            console.log(connName + " From Server: Sending: " + data.toString());
            this.end();
        });
        this.on('end', function () {
            console.log(connName + ' Client disconnected');
        });
        this.on('error', function (err) {
            console.log('Socket Error: ', JSON.stringify(err));
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