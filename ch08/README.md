#Node.js에서 구현하는 소켓서비스
소캣을 통한 통신은 백엔드 서비스 구현의 중요한 부분이다. 소켓을 통해 프로세스들은 IP주소와 포트를 통해 통신할 수 있다. 소켓을 이용한 프로세스 간 통신(IPC)은 동일한 서버에 존재하는 프로세스 간 통신뿐만 아니라 다른 서버에 존재하는 프로세스 간 통신에도 사용할 수 있다. Node.js는 net  모듈을 제공해 소켓 서버와 클라이언트 생성을 지원한다. 안전한 TLS 소켓 서버와 클라이언트 구현을 위한 tls 모듈도 제공한다.

## 네트워크 소켓 이해
네트워크 소켓은 컴퓨터 네트워크를 통한 통신의 종단에 위치. 소켓은 HTTP 계층아래에 존재하고, 서버 간의 지점 대 지점(point-to-point)통신을 제공한다.
>소켓은 IP 주소와 포트의 조합으로 구성된 소켓 주소를 사용해 동작한다. Node.js의 소켓연결은 클라이언트, 서버의 두가지형태로 존재한다. 서버는 연결을 수신하고, 클라이언트는 서버에 연결을 진행한다. 서버와 클라이언트는 유일한(Uniqe) IP주소와 포트 조합을 가져야한다.
>>Node.js의 net 모듈 소캣은 전송 제어 프로토콜(TCP, Transmission Contorl Protocol)를 사용해 원시데이터를 전송한다. TCP 프로토콜은 데이터를 패키징하고 지점 간 데이터 전송 성공여부를 보장한다. Node.js 소켓은 서버와 클라이언트 간 읽기,쓰기 스트림 데이터 지원을 위한 Duplex Stream또한 지원한다.

소켓은 http 모듈의 하부 구조로 구성. GET,POST와 같은 웹 요청에 대한 처리 기능이 필요하지 않거나 단순한 지점 간 데이터 스트림이 필요한 경우에, 소켓을 사용하면 좀 더 경량화된 해결책과 함께 추가적인 제어도 가능하다.
>소캣을 사용하면 간편하게 동일한 컴퓨터에서 실행중인 프로세스 간에 통신할 수 있다. 프로세스들은 직접 메모리는 공유할 수 없지만, 소켓을 사용해 프로세스 간 데이터 읽기 쓰기를 진행 할 수 있다.

## TCP 서버와 소켓 객체 이해하기
Node.js 어플리케이션에서 net 모듈을 사용하려면 우선 TCP 서버와 Socket 객체들의 이해가 필요하다.
이 객체들을 사용해 요청을 처리할 TCP 서버 및 요청을 만들 TCP 소켓 클라이언트를 위한 프레이워크를 제공한다. 이벤트와 속성, 함수, 객체의 행동의 이해하면 간단하게 자신만의 TCP 소켓서버와 클라이언트를 구현할 수 있다.

### net.Socket 객체
Socket 객체를 사용해 소켓 서버와 소켓 객체 둘 다 생성이 가능하고, 생성된 서버와 클라이언트는 서로 간에 데이터를 읽고 쓸 수 있다. Socket 객체는 Duplex stream으로 구성하기 때문에 Writable/Readable 스트림이 제공하는 모든 기능을 제공한다.
>예를들면, write() 함수를 사용해 클라이언트나 서버에 쓰기 스트림을 보낼 수 있다. 또는 클아이언트나 서버에서 스트림 데이터를 위한 data 이벤트 핸들러를 사용할 수 있다.

소켓 클라이언트에서 Socket 객체는 net.connect() 나 net.createConnection() 호출 시점에 내부적으로 생성이 된다. 이 객체는 서버에 소켓 연결을 표현하기 위해 사용된다.
>net socket은 서버에 소켓을 연결하여 모니터링, 서버에 데이터 전송, 서버로부터의 응답을 처리등을 할 수 있다.  Socket 객체는 데이터를 송수시간하거나 연결을 종료하는 클라이언트와 같이 동작하기 때문에 Node.js의 net 모듈에는 명시적으로 정의된 클라이언트 객체는 존재하지 않는다.

소켓 서버 상에서 Scoket 객체는 클라이언트가 연결하는 시점이나 연결 이벤트 핸들러에 전달되는 시점에 생성한다. 이 객체는 클라이언트에 소켓 연결 여부를 나타낸다. 서버에서는 Socket 객체를 사용해 클라이언트 연결과 클라이언트와 주고받는 데이터도 모니터링하게 된다.
>Socket 객체를 생성하려면 아래 함수 중 하나를 사용한다.
```sh
net.connect(options, [connectionListener])
net.createConnection(options, [connectionListener])
net.connect(port, [host], [connectListener])
net.createConnection(port, [host], [connectListener])
net.connect(path, [connectListener])
ner.createConnection(path, [connectListener])
```
모든 함수는 Socket 객체를 반환한다. 유일한 차이점은 첫 전달인자가 option, port, path로 마지막 전달인자는 동일하게 서버 연결 수립 시 실행될 콜백함수를 지정한다. net.connect()와 net.createConnection은 표현만 다를 뿐이지 똑같은 방식으로 동작한다.

>Socket 객체 생성 시 지정 가능한 옵션
- port : 클라이언트가 연결할 포트 번호 (required)
- host : 클라이언트가 연결할 도메인 이름 또는 서버 IP 주소. (기본값은localhost)
- local : 네트워크 연결을 위해 클라이언트가 바인드해야하는 내부 IP 주소
- allowHalfOpne : 불린값으로 상대 소켓에서 FIN 패킷 도착 시 자동으로 FIN 패킷을 보내지 않도록 해 Duplex스트림의 절반이 열린 상태를 유지한다. (기본값은 false)

소켓 객체가 생성이 되면 서버에 연결된 기간 동안 다양한 이벤트가 발생이 된다.
>예를 들어, 소켓 연결 시 connect 이벤트가 발생 > 읽기목적의 Readable 스트림에 데이터가 준비 > data이벤트 발생 > 서버 연결 종료 시, close 이벤트 발생.

>소켓 서버를 구현한다면 소켓 연결 수립과 종료, 데이터 읽고 쓰기 과정에서 방출되는 다양한 이벤트를 처리하는 콜백을 등록할 수 있다.

>> Socket 객체가 발생시키는 이벤트
- connect : 서버연결이 성공적으로 수립된 경우 발생. 콜백 함수는 전달인자를 갖지 않음.
- data :  소켓 상에 전달받은 데이터가 있는 경우 발생. 콜백 함수는 소켓에서 읽은 데이터 청크를 저장할 Buffer 객체를 전달인자로 반드시 받아야함.
    - 예: function(chunk){}
- end : FIN을 보내며 서버가 연결을 종료 시 발생. 콜백 함수는 별도의 인자없음
- timeout : 활동이 없어 서버 연결 만료 시에 발생
- drain : 쓰기 버퍼가 빈 경우 발생. 쏘켓에 쓰여질 데이터 스트림을 제어하는 용도로 사용가능. 콜백 함수는 별도의 인자없음.
- error : 소켓 연결 오류 시 발생 error 인자값만 유일하게 받음
    - 예: function(error){}
- close : end() 함수나 오류로 인해 소켓이 완전히 닫힐 경우 발생. 콜백 함수는 별도의 인자없음.

Socket 객체는 소켓을 통해 데이터를 읽기/쓰기, 데이터의 흐름을 중지하거나 종료시킬 수 있는 몇가지 방법을 제공함. 5장에서 다뤘던 Duplex Stream 객체에서 상속받았기 때문에 Duplex Stream와 사용법이 같음.

> socket 객체의 함수 목록
- setEncoding([encoding]) :
    - 이 함수가 호출이 되면 Buffer -> string으로 인코딩이 됨. 스트림에서 데이터 읽기/쓰기 과정의 기본인코딩 설정. 이옵션을 사용하면 BufferToString(encoding)을 사용해 버퍼를 문자열로 변환하는 과정에 훼손 될 수 있는 복수 바이트 문자처리에 대한 처리가 가능함. 데이터를 문자열 형태로 읽으려면 이 함수를 사용
- write(data, [encoding], [callback]) :
    - 데이터 buffer/string을 소켓의 Writable 스트림에 기록. encoding이 지정된 경우, 대상 인코딩을 설정. 콜백함수는 데이터가 쓰여지면 즉시 실행이 됨.
- end([data], [encoding]) :
    - 소켓의 Writable 스트림에 데이터 버퍼나 문자열을 쓰고 스트림을 비우고 연결 종료.
-destroy() :
    - 소켓 연결을 강제 종료. 소켓 연결 실패의 경우에만 필요함.
-pause() :
    - 소켓의 Readable 스트림에서 데이터 이벤트 방출을 멈춤. 데이터 업로드 시 스트림 조절이 가능하게 함.
- resume() : 
    - 소켓의 Readable 스트림에서 데이터 이벤트 방출을 제개함.
-setTimeout([timeout], [callback]) :
    - 밀리 초 단위의 timeout을 지정. 소켓이 비활성화 상태일 때 타임아웃 이벤트 발생하기 전까지 서버가 대기함. 콜백 함수는 하나의 이벤트 리스너로 트리거됨. 연결이 타임아웃 시점에 종료되게 하려면 콜백함수에 수동으로 지정해야 함.
-setNodelay([noDelay]) :
    - 데이터 전송 전 버퍼링하는 Nagle 알고리즘 비활성화 하거나, 활성화 함. 이값이 비활성화가 될 경우, 버퍼링이 비활성화가 됨.
-setKeepAlive([enable], [inintialDelay]) :
    - 연결에 Keep-alive 기능을 활성화 또는 비활성화 함. 서택적으로 사용되는 initialDelay 전달 인자는, 첫 keep-alive 패킷을 보내기전에 소켓이 idle 상태로 있는 시간을 지정함.
-address() :
    - 운영 체제에서 전달되는 바인딩된 주소, 주소 이름. 소켓 포트를 반환함. 반환 값은 'port', 'family', 'address' 속성을 포함한 객체 
        - 예 : { port : 8107, family: 'IPv4', address: '127.0.0.1' }
- unref() :
    - 소켓이 이벤트 큐에 유일한 이벤트인 경우 Node.js 어플리케이션에서 이벤트 종료 시킬 수 있게 허용.
- ref() :
    - 소켓을 재참조해 소켓이 이벤트 큐에 유일한 이벤트일 경우에도 소켓을 종료시키지 않음.

Socket 객체는 객체의 정보 접근을 위한 여러 속성값도 제공
> Socket 객체의 사용 가능한 속성
- buffersize : 현재 버퍼에 저장되고 소켓 스트림에 쓰기 대기중인 바이트 수
- remoteAddress : 소켓을 통해 연결할 원격 서버의 IP 주소
- remotePort : 소켓을 통해 여결할 원격 서버의 포트
- localAddress : 소켓 연결을 위해 사용되는 원격 클라이언트의 로컬 IP주소
- localPort :  소켓 연결을 위해 사용되는 원격 클라이언트 로컬 포트
- bytesRead : 소켓을 사용해 읽은 바이트의 수
- bytesWrite : 소켓을 사용해 기록한 바이트 수

소켓 객체를 통한 데이터 흐름을 설명하기 위해, Socket객체의 기본 구현 식 예)
```sh
var net = require('net');
var client = net.connect(
    {
        //'port'와 'host' 속성을 포함하는 선택적인 객체를 사용
        port : 8107,
        host : 'localhost',
    }, function() {
        // 소켓 연결 성공 시, write()함수 호출 및 쓰기
        console.log('Client connected');
        client.write('Some Data\n');
    }
);

//서버에서 수신한 데이터를 처리하기 위해 on.data() 이벤트 핸들러가 구현
//소켓에 저장된 데이터를 읽기
client.on('data', function(data) {
    console.log(data.toString());
    client.end();
});
// 소켓이 닫힐 때 콜솔 메세지 출력
client.on('end', function() {
    console.log('Client disconnected');
});
```
### net.Server 객체
TCP 소켓 서버를 생성하고 데이터를 읽기/쓰기가 가능한 연결을 만들기 위해서는 net.Server 객체를 사용. Server 객체는 net.createServer() 호출 시 내부적으로 생성됨.
> net.Server는 소켓 서버를 나타내고, 연결을 위한 수신 처리 후 서버 연결을 통한 데이터 송/수신을 한다.
>> 서버는 연결 수신 후 Socket 객체를 생성해 수신 중인 연결 이벤트 핸들러에 전달한다. Socket은 Duplex 스트림으로 구현대 있어 write(), data() 이벤트 핸들러를 사용해 클라이언트의 데이터 스트림을 사용할 수 있다.
>>>Server 객체를 생성하려면 아래와 같이 net.createServer() 함수를 사용한다.
```sh
net.createServer([options], [connectionListener])
```
>>>>다음은 [options] 의 들어갈 선택 사항이다.
- allowHalfOpen :
    - 불린형식으로 true로 설정하면, 상대방 소켓이 FIN 패킷을 보내는 경우에 자동으로 FIN 패킷을 보내지 않는다. 그렇기 때문에 절반은 열린 상태로 남는다. (기본값 : false)

>>>> 다음은 [connectionListener] 의 발생되는 이벤트이다.
- listening : 
    - listening() 함수 호출을 통해서 서버에서 포트 수신을 시작한 경우 발생. 콜백함수는 전달인자를 받지 않는다.
- connection : 
    - 소켓 클라이언트에서 연결을 수신한 경우 발생. ㅗㅋㄹ백 함수는 반드시 클라이언트 연결을 나타낼 Socket 객체를 전달인자로 받아야함
    - 예 : function(client){}
- close :
    - 서버가 정상적으로나 비정상적으로 닫힌 경우에 발생. 모든 클라이언트 연결이 만료 되기 전까지 이벤트가 발생.
- error : 오류 발생 시 방출된다. + close 이벤트도 같이 발생.

>>>> 다음은 [connectionListener] 에서 사용할 수 있는 함수이다.
- linsten([port], [host], [backlog], [callback]) :
    - 서버 상에 포트를 열고 연결 수신을 시작.
    - port : 수신중인 포트를 지정 (포트의 0을 지정하면 랜덤 포트 번호가 선택됨)
    - host : 수신중인 IP 주소를 지정 (생략된경우 모든 IPv4주소로 연결)
    - backlog : 서버에 허용된 최대지연 연결 수를 지정 (기본 511)
    - callback() : 서버가 포트를 열고 수신을 시작하는 시점에 호출
- linsten(path, [callback]) :
    - 유닉스 소켓 서버가 시작되는 점을 제외하면 위의 함수와 같다.
    - 파일 시스템 path에 지정된 파일을 사용해 수신을 시작
- linsten(handle, [callback]) :
    - Server 객체나 Socket 객체의 핸들이 서버의 파일 디스크립터 핸들을 가리키는 기본 _handle 멤버를 가지는 것을 제외하면 위 함수와 동일
    - 파일 디스크립터는 포트에 이미 연결된 소켓 파일을 가리킨다고 가정한다.
- getConnections(callback) :
    - 서버에 현재 연결된 연결의 수를 반환.
    - callback(error, count) : 연결 수가 계산되면 실행되고 두개의 인자값을 받는다.
- close([callback]) :
    - 새로운 연결을 받기 위해 서버를 중단한다.
    - 현재의 연결은 작업이 완료되기 전까지 남아있도록 허용
    - 서버는 모든 현재의 연결이 닫히기 전까지 실제 중단되지 않는다.
- address() :
    - 운영체제에 보고된 정보.
    - 반환 값 : { port: 8107, family: 'IPv4', address: '127.0.0.1' }
- unref() :
    - 이 함수를 호출하면, 서버가 이벤트 큐에서 유일한 이벤트인 경우 Node.js 어플리케이션이 서버를 중단 시킨다.
- ref() :
    - 소켓을 참조해 서버가 이벤트 큐에 유일한 이벤트인 경우에도 Node.js 어플리케이션이 서버를 중단시키지 않는다.

Server의 객체는 maxConnections 속성을 제공해 서버가 거부 없이 받아들일 수 있는 최대 연결 숫자를 설정한다. child_process.fork()를 사용해 자식에서 포크된 프로세스의 경우에는  maxConnections을 사용하지 말아야 한다.

>다음은 Server 객체의 기본 구현의 예이다.
```sh
var net = require('net');
var server = net.createServer(function(client) {
    // server 소켓 생성하고 콜백함수는 client로 객체를 전달달
    console.log('Client Connected');
    // 클라이언트로 부터 받은 데이터를 처리 시 .on()함수로 처리
    client.on('data', function(data) {
        console.log('Client sent ' + data.toString());
    });
    // 소켓 종료시 'end' 이벤트 핸들러 구현
    client.on('end', function() {
        console.log('Client disconnected');
    });
    client.write('Hello');
});
// 8107포트로 연결 수신
server.listen(8107, function(){
    console.log('Server listening for connections');
});
```

## TCP 소켓 서버와 클라이언트 구현
Node.js 기반의 TCP 클라이언트와 서버를 구현하는 방법이다.
>매우 기본적인 구조로만 예로 다루어진다.

### TCP 소켓 클라이언트 구현
가장 기본적인 수준에서 TCP 소켓 클라이언트를 구현하는 방식에는 서버를 연결하고 데이터를 주고 받기 위한 Socket 객체를 생성하는 일이 포함이 된다.
> 추가적으로 오류와 버퍼관리, 타임아웃과 관련된 내용을 구현한다.

```sh
// net.connect()를 호출해 소켓 클라이언트 생성
net.connect(
    {
        port : 8107,
        host : 'localhost'
    }, function() {
        //핸들러 연결부분
        //
        // 타임아웃 시간 설정
        this.setTimeout(500);
        // 버퍼를 인코딩할 인코딩 옵션 설정
        this.encoding('utf8');
        //
        // data 이벤트로 서버로부터 받은 데이터를 읽어오려면,
        this.on('data', function(data) {
            console.log('Read from server: ' + data.toString());
            this.end();
        });
    }
);
//
// 반대로, 서버에 데이터를 쓰려면,
function writeData(socket, data) {
// 소켓에 데이터가 쓰지 못하는 경우에는,
var success = !socket.write(data);
    if(!success) {
        // 데이터를 쓸 수 있을때까지 대기하고 가능할 때 함수를 재요청을 한다.
        (function(socket, data) {
            socket.once('drain', function(){
            writeData(socket, data);
            });
        }) (socket, data);
    }
}
```
> //참고// socket_client.js :: 기본 TCP 소켓 클라이언트 구현

### TCP 소켓 서버 구현
가장 기본적인 수준에서 TCP 서버와 클라이언트 구현은 다음과 같다.
- Server 객체 생성
- 들어온 연결 처리
- 데이터 송/수신
- 추가적으로, 소켓 서버는 Server객체의 close와 error 이벤트와 클라이언트 Socket 연결 이벤트 처리

> Server 객체를 사용해 소켓 서버를 구현하는 단계를 다룬다.
```sh
// net.createSever()함수를 사용해 소켓 서버 생성
// 서버가 생성되면 server 객체는 연결 콜백 핸들러를 제공한다.
var server = net.createSever(function(client) {
    //Impolement the connection callback handle code here
    //
    //connection 이벤트 호출 내에서는 연결 속성과 란련된 설정을 할 수 있다.
    // 소켓 연결 수신 종료시간 지정
    client.setTimeout(500);
    // 소켓 연결 인코딩 설정
    client.setEncoding('utf8');
    //
    // 클라이언트 연결 시 발생하는 data, end, error, timeout, close  이벤트 또한 추가  시킬 수 있다.
    client.on('data', function(data) {
        console.log("Received from client: ", + data.toString());
        //process  the data
    });
});
// listen() 호출을 통해 포트 수신을 시작한다.
server.listen(8107, function() {
    //Impolement the listen callback handle code here
    //
    //서버 객체에 close와 error이벤트를 지원할 수 있다.
    server.on('close', function() {
        console.log('Server Terminated');
    });
    server.on('error', function(err) {
    });
});
//
//서버 내에서 데이터를 쓰려면 코드 내에 write()로 명령을 구현한다.
//만약 클라이언트에서 많은 데이터를 쓰는 경우 drain 이벤트 핸들러를 구현하여 버퍼가 빈 경우에 다시 쓰기 작업을 수행할 수 있도록 한다.
//drain 이벤트를 처리할 경우, 버퍼가 가득 차서 write()의 명령이 실패가 발생한 경우에 소켓에 쓰기 조절이 필요한 경우에는 도움이 된다.
function writeData(socket, data) {
    // 데이터의 버퍼가 빈경우를 체크해 줄 수있게 생성한다.
    var success = !socket.write(data);
    // !success란 쓰기가 가능할 경우이다.
    if (!success) {
        (function (socket, data) {
            socket.once('drain', function() {
                writeData(socket, data);
            });
        }) (socket, data);
    }
}
```
> //참고// socket_server.js :: 기본 TCP 소켓 서버 구현 (테스트 하실 경우에는 socket_server.js 실행하시고, socket_client.js를 실행하면 서로간의 주고 받는 데이터가 콘솔로 보일 것이다.)

## TLS 서버와 TLS 클라이언트를 구현
전송층 보안/보안 소켓층 (TLS/Transport Layer)은 인터넷에서 안전하게 통신할 수 있게 고안된 암호화 프로토콜이다. 통신하는 소켓 서버의 적합성 여부판단을 위해 세션 키와 함께 x509인증서를 사용한다. TLS는 두 가지 방식으로 보안을 유지한다.
- 1. 장기간 사용하는 공개 키와 개인 키를 사용해 송/수신을 암호화를 위해 사용하는 세션 키를 교환.
- 2. 인증 역할 수행. 의도적이지 않는 경로로 접근하는 중간자 (man-in-the-middle)공격 방어.

>TLS를 사용하기 위해서는 TLS소켓 서버와 클라이언트 둘 다 개인키와 공개 인증서를 생성해야 한다.
키를 생성하기 위한 다양한 방법 중에서 각각의 플렛폼에 맞는 OpenSSL 라이브러리를 사용하는 것이다.
```sh
//개인키를 생성하는 방법이다.
openssl genras -out server.pem 2048
//인증 서명된 요청 파일을 생성하는 방법이다.
openssl req -new -key server.pem -out server.csr
```
주의사항
    - 인증서 서명에 거친 요청 파일을 생성할 때 몇 가지 질문에 답해야 한다. 공통 이름 입력 칸에는 연결을 원하는 서버의 도메인 이름을 넣는다. 이름을 입력하지 않으면 인증이 되지 않는다. Subject Alternative Names(주제를 대체할 이름) 필드에는 추가적인 도메인 이름과 IP 주소를 넣는다.
```sh
//내부적인 목적이나 테스트 목적으로 자체 서명한 인증서를 생성방법이다.
openssl x509 -req -days 365 -in server.csr -signkey server.pem -out server.crt
```
 주의사항
    - 자체 서명된 인증서를 테스트 목적이나 내부적 사용 목적으로는 사용할 수 있지만, 인터넷 상에 외부 웹서비스가 구현한 경우는 인증기관의 서명을 거친 인증서가 필요하다. 써드 파티 인증기관에 의해 서명된 인증서 생성을 위해서는 추가적인 단계가 필요하다.
    
---
### TLS 소켓 클라이언트 생성
TLS클라이언트 생성은 TCP소켓 클라이언트와 동일하지만 보안을 위해 추가된 사항이 있다.
```sh
var options = {
    key : fs.readFileSync('test/keys/client.pem'),
    cert : fs.readFileSync('test/keys/client.crt),
    ca : fs.readFileSync('test/keys/server.crt)
}
```
>cert, key, ca 설정을 통해 선택 사항을 정의한 후 net.connect()의 동작과 동일한 tls.connect(options, [responseCallback])를 호출 할 수 있다.
>> TCP와 TLS 소켓의 유일한 차이점은 서버와 클라이언트가 암호화 되어 있다는 것이다.
```sh
var options = {
    hostname: 'encrypted.mysite.com',
    port: 8108,
    path : '/',
    method : 'get',
    key: fs.readFileSync('test/keys/client.pem'),
    cert: fs.readFileSync('test/keys/client.crt),
    ca: fs.readFileSync('test/keys/server.crt)
}
var req = tls.connect(options, function(res) {
    <handle the connection the same as a net.connect>
});
```
>tls.connect()의 추가 선택 사항
- pfx : 
    - 개인 키, 인증서, 서버의 CA 인증 정보를 담고 있는 PFX나 PKCS12 포맷의 String또는 Buffer객체 (기본값 null)
- key :
    - SSL을 위해 사용할 개인 키를 포함한 String,Buffer객체
- passphrase : 
    - 개인키나 PFX를 위한 암호 구문을 포함한 String객체 (기본값 null)
- cert : 
    - 사용할 공개 x509인증서를 포함한 String,Buffer 객체
- ca :
     - 원격호스트 확인에 사용되는 신뢰할 수 있는 인증서의 PEM포맷 문자열이나 Buffer-Array
- ciphers : 
    - 사용하거나 제외할 암호를 설명하는 문자열
- rejectUnauthorized : 
    - 'true'인 경우, 서버 인증서가 제공된 CA목록에 있는것을 의미함. 인증에 실패하면 error이벤트 발생. 검증은 HTTP 요청을 보내기 전 연결 레벨에서 수행. 기본값 true, https.request() 옵션에서만 사용
- crl :
    - PEM으로 인코딩된 인증서 해지 목록의 문자열이나 리스트. https.createServer()에만 사용
- secureProtocol :
    - SSL 버전3를 강제로 사용하기 위해 SSLv3_method와 같은 SSL함수

TLS 소켓 서버가 생성되면 요청/응답 처리리는 8장 초반에 다뤘던 TCP 소켓 서버의 동작과 기본적으로 동일하다. 서버는 연결을 수락하고 클라이언트에 데이터를 송/수신할 수 있다.

>TLS 서버 객체의 추가 이벤트
- secureConnection : 
    - 새로운 안전 연결이 성공적으로 수립된 경우 발생한다.
    - 콜백은 데이터를 쓰기/읽기가 가능한 tls.ClearTextStream 스트리밍 객체 인스턴스 하나를 받는다.
    - function(clearStream){}
- clientError :
    - 클라이언트 연결 오류 발생 시 방출.
    - error 와 tls.SecurePair 객체를 콜백의 전달인자로 받는다.
    - function(error, securePair){}
- newSession :
    - 새로운 TLS 세션 생성 시 발생한다.
    - 세션 정보를 포함하는 sessionId와 sessionData를 콜백의 전달인자로 받는다.
    - function(sessionId, sessionData){}
- resumeSession : 
    - 클라이언트가 이전 TLS 세션을 재개하려는 경우 발생
    - 세션을 외부 저장소에 저장해 이벤트 수신 시 확인할 수 있다.
    - 핸들러는 sessionId와 세션이 수립되지 않는 경우 실행될 callback을 전달인자로 받는다.
    - function(seesionId, callback){}

---
##요약
소켓은 Node.js 어플리케이션에서 백엔드 서비스를 구현하는데 있어 굉장히 유용하다. 소켓을 사용해 IP주소와 포트만 가지고 간현히 서로 다른 시스템이 통신을 할 수 있다. 또한 동잉한 서버에서 실행중인 프로세스 간의 IPC에도 유용하게 사용할 수 있다.
> net 모듈을 사용해 소켓 서버와 같이 동작하는 Server 객체를 생성할 수 있고, 소켓 클라이언트와 같이 동작하는데  Socket 객체도 생성 가능하다. 
>> Socket 객체는 Duplex 스트림을 확장했기 때문에 서버와 클라이언트 둘 다 읽기/쓰기가 가능하다. >>> 안전한 연결을 위해서는 tls 모듈을 사용해 안전한 TLS 소켓 서버와 클라이언트를 구현한다. 
