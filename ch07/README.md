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
>>>>다음은 url.pase() 수행시 반환값이 URL값의 속성들이다.
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

