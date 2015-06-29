#Chaper.07 HTTP 서비스를 node.js로 구현

이번장은 http 모듈을 사용한 클라이언트, 서버 구현에 포커싱을 맞췄다. 이번장에서 다루는 예제는 기본적인 형태기 때문에 확장해 사용하는데 굉장히 용이할 것이다.
##URL처리
###URL이란?
>>단일 자원 위치지정자(URL, uniform resource locator)는 HTTP 서버가 클라이언트의 요청을 처하는데 사용하는 주소와 같은 역할은 한다. URL에서는 정확한 서버에 접속해 지정한 포트로 접근을 하고 적절한 데이터를 접근하기 위해 필요한 모든 정보를 가지고 있다.
>>URL에는 몇가지 구성요소로 구성되는데, 각 요소들은 웹서버가 클라이언트의 HTTP요청을 라우팅하고 처리하는 방법을 나타낸다. 전부다 갖추지 않아도 URL은 잘만돌아간다.
```sh
http:// user.pass@host.com:80/resource/path/?query=string#hash
```
- http:// 프로토콜
- user.pass : 인증정보
- host.com : 호스트
- 80 : 포트
- resource/path?query=string : 경로
- path?query=string : 검색/요청
- hash : 해시

---
###URL객체의 이해
>url.parse는 Node.js에서 URL 정보를 효율적으로 사용하는 url모듈이다.
>>url.parse(urlStr, [parseQueryString], [slashesDenoteHost])
- urlStr : URL의 문자열값
- parseQueryString : URL의 질의 문자열이 문자열 객체로 파싱된 경우 true로 반환한다. 기본값은 'false'로 되어있다.
- slashesDenoteHost 는 //host/path 형태의 url값이 {pathname:'//host/path'}가 아닌 {host, 'host', pathname : '/path'}로 파싱 될 경우 true값을 갖는다. 기본값은 'false'로 되어있다.
>>>또한 url.format() 함수를 이용하면 아래와 같이 URL 오브젝트를 문자열 객체로 변환이 가능하다.
```sh
// URL문자열을 파싱해 객체로 만든 후 다시 문자열로 변환하는 예제이다.
var url = require('url');
var urlStr = 'http:// user.pass@host.com:80/resource/path/?query=string#hash';
var urlObj = url.parse(urlStr, true, false);
urlString = url.format(urlObj);
```
>>>>다음은 url.parse() 수행시 반환값이 URL값의 속성들이다.
- href : 파싱할 URL 전체 문자열
- protocol : 소문자 형태의 요청 프로토콜
- host : 소문자 형태의 URL의 전체 host 부분, port정보를 포함
- auth : URL의 authenication 정보부분
- hostname : 소문자 형태의 hostname  부분
- port : 포트번호 부분
- pathname :  URL의 경로부분, 첫 부분의 '/'가 있는 경우 포함
- search : URL의 검색/요청 부분, 시작 부분의 '?' 포함
- path : pathname + search 를 포함한 전체 경로
- query : 질의 문자열의 parameter부분 또는, parseQueryString이 true로 설정한 경우 query문자열 전달인자와 값을 포함한 파싱된 형태의 객체
- hash :  URL의 해시 부분 '#' 포함


###URL 구성요소 해석
>url 모듈의 유용한 기능은 URL 구성요소를 브라우저와 같은 방식으로 해석한다. 이 모듈을 사용하 서버 단에 URL에 맞춰 URL 문자열을 조작할 수 있다. 옮겨지거나 변경된 전달인자의 처리를 위해 요청을 처리하기에 앞서 URL 위치를 변경하는 경우, URL을 새로운 위치로 해석하려면 다음 코드를 이용한다.
```sh
url.resole(from, to)
//예제로 살펴보자
var url = require('url');
var originalUrl = 'http://user.pass@host.com:80/resource/path/?query=string#hash';
var newResource = '/another/path?querynew';
console.log(url.resolve(originalUrl, newResource));
// 로그출력값
// http://user.pass@host.com:80/another/path?querynew
// Path만 변경되었다.
```
###질의 문자열과 폼 전달인자 처리
질의 문자열과 폼 전달인자는 키/값 쌍으로 구성된다. Node.js로 구성한 웹 서버에서 실제 이 값을 얻으려면 querystring 모듈의 parse() 함수를 사용해 문자열을 자바스크립트 객체로 변환한다.
```sh
querystring.parse(str, [sep], [eq], [option]);
// str : 질의 문자열이나 전달인자 문자열 지정
// sep : 구분자를 지정 (기본 구분자는 '&')
// option : 결과 객체를 얻는데 사용할 키의 제한을 maxKeys값으로 지정
```
>질의 문자열을 파싱하기 위해 parse()를 사용하는 예제는 다음과 같다.
```sh
var qstring  = require('querystring');
var params = gstring.parse('name=Brad&color=red&color=blue');
//Ths Params object created would be:
//{name:'Brad', color:['red','blue']}
//
//객체를 문자열로 변환하려면
querystring = stringify(obj, [sep], [eq]);
```
###요청, 응답, 서버 객체의 이해
Node.js 어플리케이션에서 http 모듈을 사용하랴먄 우선 요청 객체(request object)와 응답객체(response object)를 이해해야한다. 이 객체들은 정보와 함께 HTTP 클라이언트와 서버의 많은 기능을 제공한다. 속성값과 이벤트, 함수를 포함한 객체의 구성을 잘 이해하면 간단한게 HTTP서버와 클라이언트를 구현할 수 있다.

----
####http.ClientRequest 객체
ClientRequest 객체는 HTTP 클라이언트 구성을 위해 http.request() 호출 시에 내부적으로 생성이된다.
ClientRequest 객체는 요청을 초기화하고 모니터링과 서버 요청 처리를 위해 사용된다.
>ClientRequest 객체는 Writable 스트림으로 구성돼 있어서 Writable 스트림 객체의 모든 기능을 제공한다.write() 함수를 사용해 ClientRequest 객체를 Readable 스트림에 파이프로 연결할 수 있다.
```sh
//ClientRequest 객체를 구현하려면 http.request()를 다음과 같이 호출한다.
http.request(option, callback);
// option : 클라이언트의 HTTP 요청을 열고 서버에 전송하는 방법에 대한 속성을 지정한다.
// 기본 구현예제
var http = require('http');
var options = {
    hostname: 'www.myserver.com',
    path: '/',
    port: '8080',
    method: 'POST'
};
var req = http.request(options, function(response){
    var str = '';
    response.on('data', function(chunk){
        console.log(str);
    });
});
req.end();
```
ClientRequest options
- host : 요청을 시도할 서버의 도메인 이름이나, IP주소
- hostname : host와 동일하지만, url.parse()를 지원해 더 선호가 되는 옵션이다.
- port : 리모트 서버의 포트. 기본값은 80
- localAddress : 네트워트 연결을 위해 바인트(bind)되는 로컬 인터페이스
- socketPath : 유닉스 도메인 소켓(host:port나 socketPath 형태로 사용)
- method : HTTP 요청 방식을 지정하는 문자열. GET이나 POST, CONNECT, OPTIONS 등. 기본 값은 GET이다.
- headers : 요청 헤더를 포함하는 객체. 예{'content-length':'750', 'content-type':'text/plain'}
- auth : Authorization 헤더를 위해 사용되는 user:password 형태의 기본 인증정보
- agent : Agent 동작의 정의 Agent가 사용된 경우 요청 기본 값은 'Connetion:keep-alive'
    이다.
    - agent에서 가능한 값은,
        - undefined (default): 전역 Agent 사용
        - Agent : 등정 Agent객체 사용
        - false : Agent동작 비활성화

ClientRequest 객체는 요청 처리 과정에 필요한 다양한 상태를 처리할 수 있는 이벤트제공. 서버의 응답을 받았을 때 발생하는 response 이벤트를 처리하는 리스너를 추가할 수 있다.
>ClientRequest 사용 가능한 이벤트
- response : 서버로부터 요청에 대한 응답을 받았을 때 발생. 콜백 핸들러는 전달인자로 IncomingMessage객체를 받는다.
- socket : 요청에 대한 소켓이 할당된 경우 발생
- connect : CONNECT 방식을 사용한 요청 초기화에서 서버가 응답한 경우 매번 발생. 이벤트가 클라이언트에서 처리되지 않는 경우에는 연결이 닫힌다.
- upgrade : 갱신 요청을 포함한 헤더를 가진 요청에 서버가 응답한 경우 발생
- continue : 서버가  100 Continue라는 HTTP 응답을 보내 클라이언트에게 body를 포함해 요청을 보내도록 지시할 때 발생.

>clientRequest 객체의 가용 함수 목록
- write(chunck, [encoding]) : 
    - 요청이 body에 Buffer나 String객체를 청크를 쓴다. ClientRequest 객체의 Writable 스트림에 스트림 데이터를 쓴다. body데이터를 스트림하려면 요청 생성 시 헤더 옵션으로 {'Transfer-Encoding', 'chunked'}를 넣는다.
- end([data], [encoding]) :
    - 요청 body에 선택적으로 데이터를 쓰고, Writable 스트림을 비운 후 요청을 종료.
- abort() : 
    - 현재 요청 중단
- setTimeout(timeout, [callback]) :
    - 선택 사항인 콜백 함수가 만료 시 실행될 수 있게 하면서 요청에 대한 socket만료를 밀리 초 단위로 지정
- setNodelay([noDelay]) :
    - 데이터를 보내기 전에 저장하는 Nagle 알고리즘을 비활성화 한다.
    - noDelay : 즉시 쓰기의 경우 true. 버퍼방식으로 쓰기의 경우 false값을 가진다.
- setSocketKeepAlive([enable], [initialDelay]) :
    - 클라이언트 요청의 keep-alive 기능을 활성화하거나 비활성화한다.
    - enable : 기본 값은 비활성화 상태인 false다.
    - initialDelay : 마지막 데이터 패킷과 첫 keep-alive요청 사이의 지연시간을 지정한다.

####http.ServerResponse 객체
HTTP 서버는 request  이벤트 수신시 내부적으로 ServerResponse 객체를 생성한다.
이 객체는 request 이벤트 핸들러를 두 번째 전달인자로 받는다. ServerRequest 객체를 사용해 클라이언트 요청에 대한 응답을 정형화해 보낸다.
>ServerResponse 객체는 Writable 스트림을 구현하기 때문에 Writable 스트림 객체의 모든 기능을 제공한다.
- 예를들어, ServerResponse 객체는 write()함수를 사용해 Readable 스트림에 파피프를 연결해 클라이언트로 데이터를 보낼 수 있다.
>ServerResponse 객체의 이벤트 속성
- close :
    - 응답 종료 및 비우기 작업을 위한  response.end()가 호출 되기 전에 클라이언트 연결이 종료된 경우에 발생한다.
- headerSent :
    - 헤더 전송이 마친 경우 'true', 아닌경우 'false'. 읽기전용 속성이다.
- sendDate :
    - Date 헤더가 자동으로 생성돼 응답의 일부로 전송된 경우 'true'
- statusCode :
    - 명시적으로 헤더에 값을 쓰지 않더라도, 응답 상태 코드로 지정 가능
    - response.statusCode = 500;

>ServerResponse 객체 함수
- writeContinue() :
    - 클라이언트에 HTTP/1.1 100 Continue 메세지를 보내어 본문 데이터가 계속 전송되기를 요청
- writeHead(statusCode, [resonPharase], [headers]) :
    - 요청에 대한 응답 헤더를 쓴다.
    - statusCode : HTTP 응답 상태의 대한 3자리 코드 (200, 401, 500)
    - [resonPharase] : statusCode의 이유를 나타낸다.
    - [headers] : 아래와 같은 응답 헤더의 객체이다.
    - response.writeHead(200, 'Success', { 'content-Length' : body.length, 'content-Type' : 'text/plain' });
- setTimeout (msecs, callback) :
    - 클라이언트 연결을 위한 소켓의 밀리초 단위의 타임아웃 시간을 설정한다.
    - callback : 타임아웃 발생 시 수행되는 함수
- setHeader (name, value) :
    - 특정 헤더의 값을 설정
    - name :  헤더의 이름
    - value : 헤더의 값
- getHeader (name) :
    - 응답에 설정된 HTTP 헤더값을 가져온다.
- removeHeader (name) :
    - 응답에 설정된 HTTP 헤더값을 제거한다.
- write (chunk, [encoding]) :
    - 응답 Writable 스트림에 chunk나 Buffer, String 객체를 쓴다. 데이터는 응답의 body 부분에만 쓴다. 기본 인코딩은 utf8이다. 데이터 쓰기에 성공하면 'true'로 반환하고, 사용자 메모리에 쓰여진 경우 false로 반환. false로 반환된 경우, 버퍼가 다시 비워지면 Writable 스트림이 drain이벤트를 발생시킨다.
- addTrailers (header) :
    - 응답 끝에 HTTP 트레일링(trailing) 헤더를 추가한다.
- end ([data], [encoding]) :
    - 응답 body에 선택적인 데이터를 작성하고 Writable 스트림을 비운 후 응답을 마무리한다.

####http.IncomingMessage 객체
HTTP 서버나 HTTP 클라이언트는 IncomingMessage 객체를 생성한다. 서버 단에서는 클라이언트의 요청이 IncomingMessage 객체가 되고 클라이언트 단에서는 서버의 응답이 IncomingMessage객체가 된다. 이렇게 같은 이유는 양 단에서 기본 동작이 동일하기 때문이다.
>IncomingMessage는 Readable 스트림을 만들기 때문에 클라이언트의 요청이나 서버의 응답을 처리하는 스트리밍 소스로 활용할 수 잇다. 즉, readable.data  이벤트를 만들 수 있다.

>Readable 클레스에서 제공하는 기능 외에도, IncommeMessage는 더 많은 기능을 제공한다.
- close : 소켓 종료 시 이벤트 발생
- httpVersion : 클라이언트 요청/응답 생성에 사용된 HTTP 버전을 지정한다.
- headers :  클라이언트 요청/응답 시 헤더에 포함된 객체
- trailers : 요청/응답 시 트레일러 헤더에 포함된 객체
- method : 요청/응답에 사용할 방법 (GET,POST,CONNECT) 지정
- url : 서버에 전성할 URL로 url.parse()를 사용해 전달 가능한 문자열, HTTP 서버에서 클라이언트 요청 처리에만 사용
- statusCode : 서버에서 3자리 숫자로 지정한 상태코드이며, 서버의 응답을 처리하는 HTTP 클라이언트에서만 사용
- socket : 클라이언트/서버와 통신에 사용되는 net.Socket 객체의 값
- setTimeout(msecs, callback) : 타임아웃 시 수행될 콜백함수가 밀리초단위로 소켓 만료 시간 설정

####HTTP Server 객체
Node.js의 HTTP Server 객체는 HTTP 서버를 구현하는데 기초가 되는 프레임워크를 제공한다. HTTP Server는 지정된 포트에서 수신하고 요청을 받은 후 연결된 클라이언트에 응답을 보낸다. 서버가 수신중인 경우 Node.js 어플리케이션은 종료되지 않는다.
>Server 객체는 EventEmitter를 구현에 아래의 나열된 이벤트를 방출한다. HTTP 서버구현처럼 이 이벤트들의 일부나 전체를 처리할 이벤트 핸들러 정도는 필요하다.
>>Server 객체 발생 이벤트
- request :
    - 서버가 클라이언트 요청/수신 시 매번 발생. 콜백은 두가지 전달인자를 받는다.
    - 1.클라이언트 요청을 표현 할 IncomingMessage 객체
    - 2.정형화하고 전송할 응답에 관한 ServerResponse 객체이다.
    - callback(request, response){};
- connection :
    - 새로운 TCP 연결 수립 시 발생되는 이벤트.
    - callback(socket){};
-close : 
    - 서버 종료 시 발생되는 이벤트
    - 콜백은 없다.
-checkContinue : 
    - Expect:100-continue 헤더가 포함된 요청 수신 시 발생.
    - 이벤트 핸들러로 지정하지 않아도 기본 이벤트 핸들러가 Expect:100-continue 요청에 응답을 수행한다.
    - callback(request, response){}
-connect : 
    - HTTP CONNECT 요청 수신 시 발생.
    - 콜백은 터널링 스트림의 첫 패킷을 포함하는 버퍼인 request, socket, head를 받는다.
    - callback(request, socket, head){}
-upgrade : 
    - 클라이언트가 HTTP 업그레이드 요청 수신 시 발생.
    - 이 이벤트가 처리되지 않는 경우 업그레이드 요청을 보낸 클라이언트는 연결을 종료한다.
    - 콜백은 터널링 스트림의 첫 패킷을 포함하는 버퍼인 request, socket, head를 받는다.
    - callback(request, socket, head){}
-clientError :
    - 클라이언트 연결 소켓 오류 발생 시 발생
    - callback(error, socket){}
    
>HTTP 서버를 시작하는 예이다. createServer()함수를 사용해 server객체를 생성해야한다.
```sh
http.createServer([requestListener]);
// 반환값 : Server Object
// [requestListener] : 요청 이벤트 발생 시 수행될 콜백 지정한다. 
// callback(IncominMessage, ServerResponse){}
```
>서버 객체를 생성한 경우, Server 객체의 Listen() 함수를 호출해 요청을 받는다.
```sh
listen(port, [hostname], [backlog], [callback])
// port : 수신할 포트 지정
// [hostname] : 연결을 수락할 hostname을 지정. 생략된 경우 모든 IPv4주소연결 수락
// [backlog] : 큐에 허용된 지연 연결의 최대 개수지정. 기본값은 511
// [callback] : 서버가 지정된 포트로 수신 시작 시 실행할 콜백 핸들러 지정.
// 기본 서버 시작 및 수신예
var http = require('http');
http.createServer(function (req, res){
    <<handle the request and response here>>
}).listen(8080);
// 파일 시스템을 통해 수신이 가능한 두 가지 다른 방법이 존재한다.
// 1.수신할 파일의 경로 정보 path사용 ...}).listen(path, [callback]);
// 2. 이미 열린 파일 디스크립터인 handle 사용 ...}).listen(handle, [callback]);
```

##Node.js에서 HTTP 클라이언트와 HTTP 서버를 구현
예제를 통해 클라이언트/서버의 기본 개념을 알아 본 후 요청과 응답을 처리하는 방법을 다룬다.
예제들은 오류 처리, 공격 대응과 같은 추가 기능에 대한 내용을 포함하지 않는다. 하지만 http 모듈을 사용해 일반적인 HTTP 요청을 처리하는데 필요한 기본 호름과 구조에 관한 유용한 내용을 제공한다.

###정적 파일 제공
HTTP 서버의 가장 기본적인 형태는  정적 파일(Static file)을 제공하는 것이다. Node.js에서 정적 파일을 제공하려면 우선 HTTP서버를 시작하고 포트를 수시한다. 요청 핸들러에 fs모듈을 통해 파일을 지역적으로 열고 응답에 파일 내용을 쓴다.

- //참고//  http_server_static.js :: 기본 정적 파일 웹서버 구현 
- //참고//  http_client_static.js :: 정적 파일을 가져오는 기본 웹 클라이언트