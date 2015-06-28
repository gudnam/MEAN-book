#Chapter.06 Node.js에서의 파일시스템 접근

#동기적 파일 시스템 호출 vs 비동기적 파일일시스템 호출
#####동기적 호출이란?
>동기적 호출은 호출의 끝날때까지 블록 상태를 유지한 후 스레드로 제어가 넘어온다. 
다만, 메인 이벤트 스레드를 블록하거나 너무 많은 백그라운드 스레드를 실행할 경우, 성능의 저하를 가져올 수 있다. 이러하는 이유로 동기적 호출은 node.js에는 적합하지가 않다.

#####비동기적 호출이란?
>비동기적 호출은 이벤튜 큐에 추가된 후에 실행이 된다. 이방식은 Node.js의 이벤트 모델에 적합한 방식이다.

##### 그럼 둘의 차이점은?
>동기적, 비동기적 파일 시스템 호출의 내부의 기능은 동일하다. 둘 다 같은 전달인자를 사용하데는 비동기적 호출의 경우 마지막 전달인자로 파일 시스템 호출의 완료 후 수행 될 때 콜백 함수를 지정하는 부분에서 다르다.

>>각각의 파일에 단점과 장점은 있다. 동기적인 호출은 한파일 내부에서 지속적으로 읽거나 쓰기를 반복할때 최적의 효율성을 보이나, 다른 스레드에서 파일에 접근할 경우에는 성능저하를 가져올수 있다. 또한 비동기적 호출은 다른 스레드끼리의 접근 할 경우에는 용이 하지만 같은 파일에서 지속적인 접근을 할 경우에는 성능 저하의 영향을 끼칠 수 있다.

---
###파일 열기 및 닫기
>>Node.js는 파일을 열기위한 동기적 비동기적 함수를 둘다 제공한다. 한 번 열린후에는 파일을 열 때 사용했던 플래그 값에 맞춰 데이트를 읽고 쓸 수 있다. 
```sh
fs.open(path, flags, [mode], callback);
fs.openSync(path, flags, [mode]);
```
#####flags 전달 인자값은 파일을 열기 위한 모드의 옵션을 지정할 수 있다.
- r : 읽기 가능 파일 열기. 파일이 존재하지 않을 경우 예외가 발생
- r+ : 읽기 쓰기 가능 파일 열기. 파일이 존재하지 않을 경우 예외가 발생
- rs : 동기화 모드로 읽기 가능 파일 열기. fs.openSync()와는 동일하지 않다. 사용시 로컬 파일 시스템 캐시를 통과한다. NFS 마운트 경우 오래된 로컬 캐시가 존재하지 않도록 만들기 때문에 유용. 시스템 성능 저하를 가져올 수 있기 때문에 플래그 사용에 각별한 주의가 요망.
- w : 쓰기 가능 한 파일 열기. 파일이 존재하지 않는 경우 새로 생성하고, 존재하는 경우 기존 내용 제거 후 내용 덮어쓰기
- wx : 기존 경로가 존재할 경우 실패를 제외한 나머지 기능은 'w' 옵션과 동일하다.
- w+ : 읽기 쓰기 가능 파일 열기. 파일이 존재하지 않을 경우, 파일 생성하고. 존재하는 경우 기존 내용 제거 후 내용 덮어쓴다.
- wx+ : 기존 경로가 존재할 경우 실패하는것을 제외한 나머지의 경우는 w+와 동일.
- a : 추가를 위한 파일 열기. 파일이 존재하지않을 경우 파일 생성.
- ax : 기존 경로가 존재할 경우에 실패. 그외에는 w와 동일.
- a+ : 읽기.추가를 위한 파일 열기. 파일이 존재하지 않으면 파일을 새로 생성.
- ax+ : 경로가 존재하는 경우에 실패. 그외에는 a+와 동일.

파일을 연 경우, 디스크에 변경 내역을 강제적으로 비우고, 운영체제의 파일 락을 해제하기 위해 파일을 닫는다. 파일을 닫으려면 파일 디스크립터를 전달인자로 사용하여 아래 함수 호출. 비동기 close() 함수의 경우 콜백 함수를 지정한다.
```sh
fs.close(fd, callback);
fs.closeSync(fd);
```
비/동기 모드로 파일을 열고 닫는 예제. err와 fb를 전달인자로 받는 콜백함수 지정. 그리고 fb는 파일을 읽고 쓰기 위해 사용하는 파일 디스크립터 지정.
```sh
//동기 모드
var fd = fs.openSync("myFile", 'w');
fs.closeSync();

//비동기모드
fs.open("myFile", 'w', function(err, fb){
    if(!err) {
        fs.close(fd);
    }
});
```
>비동기 모드와 동기 모드의 차이점은 비동기에서는 꼭 콜백함수를 지정하는 부분이 2개의 예제부분에 다르다는 것을 느꼈을 것이다. 

---
## 파일 쓰기
fs(File system) 모듈에서는 총 4가지의 방법을 제공한다.
- 단일 호출로 파일에 데이터 쓰기
- 동기 쓰기를 사용해 chunk(덩어리) 단위로 쓰기
- 비동기 쓰기를 사용해 chunk(덩어리) 단위로 쓰기
- writable  스트림을 통한 스트림 쓰기

#### 간편한 파일쓰기
파일에 데이트를 쓰기 위한 가장 간편한 방법은 writeFile() 함수를 사용하여 쓰기이다.
```sh
//비동기 방식
fs.writeFile(path, data, [options], callback);
//동기 방식
fs.writeFileSync(path, data, [options]);
```
>path 전달인자를 통해 파일의 경로(절대/상대) 지정. data 전달인자를 통해 파일에 쓸 String이나 Buffer객제 지정. 선택적으로 사용하는 options 전달인자에는 문자열이나 encoding이나 파일을 열 때 사용할 mode, flag속성 전달. 비동기 함수의 경우 파일 쓰기 완료 후 수행될 콜백 함수를 전달해야한다.

>> //참고//  file_write.js :: 파일에 JSON 문자열 쓰기

#### 동기적 파일 쓰기
>비동기적 파일 쓰기 함수의 경우 실행중인 스레드로 제어를 넘기지 않고 파일에 데이트를 쓴다. 여러번 지속적으로 데이터를 저장 시켜줄때는 용이하지만, 다른 스레드의 수행을 방해한다.
>>동기적 파일를 쓰기위해서는 openSync()를 사용해 파일 디스크립터를 얻은 후 fs.writeSync()를 사용해 파일에 데이터를 쓴다. fs.writeSync()는 아래와 같이 사용한다.
```sh
fs.writeSync(fd, data, offset, length, position);
// fd:openSync()가 반환한 파일 값
// data : 파일에 쓸 String 또는 Buffer 객체지정값
// offset : data에서 읽기 시작할 위치 (만약 첫부분 부터 시작할 경우, null로 설정)
// length : 쓰기를 수행할 바이트의 크기를 지정. (data의 처음부터 끝까지 쓰기를 수행하고 싶은 경우, null로 지정)
//position : 쓰기를 시작할 파일 내 위치를 지정. (현재위치를 지정하고 싶은경우, null로 지정)
```
>> //참고//  file_write_sync.js :: 동기적 파일 쓰기 수행

---
#### 비동기적 파일 쓰기
>비동기 방식의 파일 쓰기 함수는 쓰기 요청을 이벤트 쿠에 넣은 후 호출한 코드로 제어를 반환한다. 실제쓰기는 이벤트 큐에소ㅓ 쓰기 요청이 뽑아져 나와 실행되지 전까지 이뤄지지 않는다. 동일한 파일에 여러 쓰기 요청을 수행할 때는 실행 순서가 보장되지 않기 때문에 주의하도록 한다.

>>파일에 비동직적으로 쓰기를 진행하려면 open()을 사용해 파일을 열고 콜백 함수를 수행 후에 fs.write()를 사용해 파일에 데이터를 쓴다. file.write()를 사하는 문법은 다음과 같다.
```sh
fs.write( fd, data, offset, length, position, callback);
//fd : openSync()가 반환한 파일 디스크립터 값 지정
//data : 파일에 쓰기를 수행할 String이나 Buffer객체를 지정한다.
//offset : buffer 전달안지는 쓰기를 수해할 버퍼 내 위치를 지정한다. 버퍼의 처음시작위치에서 시작을 할 경우에는 null로 지정한다.
//length : 쓰기를 수행할 크기를 지정. 버퍼의 끝까지 쓰기를 진행 하려면 이값은 null로 지정한다.
//callback : error, bytes라는 두개의 전달인자가 있는 함수를 지정한다.error는 쓰기 도중 발생한 오류가 기록되고, bytes는 쓰기가 진행된 크기를 지정한다.
```
>>> //참고//  file_write_async().js :: 파일에 비동기방식으로 쓰기 수행

---
#### 스트리밍 파일 쓰기
>대량의 데이터를 파일에 쓰기 위해 가장 효율적인 방법 중 하나는 파일을 열어거 Writable 스트림으로 사용하는 스트리밍방식이다. 이 방식을 사용해 HTTP 요청과 같은 Readable 스트림 소스에서 매우 간편이 데이터를 쓸 수 있다.
>> //참고//  file_write_stream.js :: 스트리밍 방식으로 파일 쓰기 수행

###파일 읽기
fs(File system) 모듈에서는 총 4가지의 방법을 제공한다.
- 하나의 큰 청크(chunk)사용
- 동기 읽기를 사용한 청크 사용
- 비동기 읽기를 사용한 청크 사용
- Readable 스트림을 통한 스트리밍 사용
모두 효과적이기 때문에 어플리케이션에 요구에 맞게 사용하면 된다.

####간단한 파일 읽기
>파일에서 데이터를 읽기 위한 가장 간단한 방법은 readFile()함수를 사용하는 것이다.
이 함수는 파일 내용 전부를 테이터 버퍼로 읽어 들인다. 다음은 readFile() 함수에 대한 구문이다.

```sh
//비동기
fs.readFile(path , [options], callback);
// 동기
fs.readFilesync(path, [options]);

//path : 상대 경로나 절대 경로의 파일 위치를 지정한다.
//options : encoding, mode, flag  송석을 지정해 문자열 인코딩과 파일을 열때 사용하는 모드와 플레그를 설정.
```
>>참고 file_read.js ::: 객체에서 JSON문자열 읽기

---
####동기적 파일 읽기
>파일을 읽는 동기적 방법은 실행중인 스레드로 제어가 반환되기 전에 데이터를 읽기를 완료한다.
이 방식은 같은 코드 영역에서 여러번 읽기 동작이 발생할 경우에는 유리하지만, 다른 스레드에서 같은 파일에 대한 읽기를 시도할 때에는 속도가 느려지는 단점이 있다.
>> 파일을 동기적으로 읽으려면 먼저 openSync()를 사용해 파일을 열고, 이 때 얻은 파일 디스크립터를 readSync()에 전달해 파일의 데이터를 읽는다.
```sh
fs.readSync(fd, buffer, offset, length, position);
//fd : openSync()가 반환한 파일 디스크립터 값 지정
//buffer : 파일로부터 읽은 데이터를 포함하는 Buffer 객체 지정.
//offset : buffer 전달안지는 쓰기를 수해할 버퍼 내 위치를 지정한다. 버퍼의 처음시작위치에서 시작을 할 경우에는 null로 지정한다.
//length : 읽기를 수행할 크기를 지정. 버퍼의 끝까지 쓰기를 진행 하려면 이값은 null로 지정한다.
```
>>>참고 file_read_sync.js ::: 객체에서 JSON문자열 읽기

####비동기적 파일 읽기
>비동기적 파일 읽기 방식은 읽기 요청을 이벤트 큐에 넣고 제어를 호출한 코드로 넘겨준다. 실제 읽기 동작은 이벤트 큐에서 해당 요청이 꺼내져 처리될 때까지 미뤄진다.
비동기적 파일 읽기동작은 실행 순서가 보장되지 않기 때문에 일기 순서가 중요한 작업에서는 주의해야 한다. 순서를 보장 하려면 다음 예시에 나온 절차처럼 이전 읽기 요청의 콜백 함수내에 중첩된 읽기 요청을 진행해야한다. 비동기적으로 파일을 읽으려면 우선 open()을 사용해 파일을 열고 open 요청에 대한 콜백이 수행되면 read()를 사용하는 문법은 다음과 같다.
```sh
fs.read(fd, buffer, offset, length, position, callback);
//fd : openSync()가 반환한 파일 디스크립터 값 지정
//buffer : 파일로부터 읽은 데이터를 포함하는 Buffer 객체 지정.
//offset : buffer 전달안지는 쓰기를 수해할 버퍼 내 위치를 지정한다. 버퍼의 처음시작위치에서 시작을 할 경우에는 null로 지정한다.
//length : 읽기를 수행할 크기를 지정. 버퍼의 끝까지 읽기를 진행 하려면 이값은 null로 지정한다.
//callback : error, bytes, buffer라는 세가 전달인지가 있는 함수를 지정한다.error는 읽기 도중 발생한 오류를 나타내고, bytes는 읽을 바이트 수를 지정, buffer는 읽기 요청으로 얻은 데이터가 저장된 버퍼이다.
```
>>참고 file_read_async.js ::: 비동기 방식으로 파일 읽기 수행

####스트리밍 방식 파일 읽기
>많은 양의 데이터를 읽기 위한 최적의 방법은 파일을 Readable 스트림으로 읽는 파일 스트리밍 방식을 사용하는 것이다. pipe()함수를 사용하면 스트리밍 방식으로 읽고 쓰기를 한꺼번에 할 수도 있다.
>>비동기적으로 파일에서 데이터를 스트리밍하려면 우선 아래와 같이 Readable 스트림 객체를 생성해야 한다.
```sh
fs.createReadStream(path, [options])
//path : 절대/상대 파일의 경로 값
//options : encoding, mode, flags 속성을 지정해 문자열 인코딩과 파일을 열 때 사용할 모드와 플래그 값을 설정한다.
```
>>>Readable 파일 스트림을 연 후에는 read() 요청에 대한 readable 이벤트를 사용해 데이터를 간편히 읽을 수 있다.
>>>>//참고// file_read_stream.js ::: 파일에서 스트리밍 읽기 가능한  Readable 스트림구현

####Writable and Readable Stream 방식의 최적화 파일 읽고 쓰기
>Node.js 0.10 이상부터 가능한 스트리밍 파일 읽고 쓰기입니다. 기존의 Stream은 데이터의 과부화의 문제점을 극복하고 stream2라는 이름으로 이문제를 해결하였습니다.
>>'data' 이벤트에 기반한 스트림이 갖는 한가지 문제는 stream 을 읽는 타이밍이나 한번에 얼마나 많은 데이터를 읽을 지를 제어할 수가 없다. data 이벤트가 걸리면, 핸들러는 버퍼에 데이터를 쓰거나 디스크에 정상적으로 써야한다. 이런 상황은 매우 느리거나 제한된 쓰기 I/O를 가진 경우에 문제가 된다. 그래서 노드 v0.10 부터 새로운 스트림 인터페이스를 stream2 라는 이름으로 선보였다.
>>Readable이나 Writable 인경우, 데이터를 읽을 수 있는 경우 또는, 데이터를 쓸 수 있는 경우에 바로 데이터를 얼마나 많이 읽고, 쓸 수 있는지 제어가 된다.
>>만약, 데이터의 제어가 불가능한 상황(트레픽, CPU의 과부화가 걸렸을 경우, writable||readable 값을 false로 정해준다음에 다시 루프를 돌면서 과부화 상황이 안정화 될경우에 그때 본래의 기능을 하게 된다.)

## 기타 파일 시스템 작업
> fs는 파일 읽기, 쓰기 외에도 파일 시스템 처리와 관련된 추가 기능을 제공한다.
- 디렉토리 내 파일 목록 조회
- 파일 정보확인
- 기타 등등
### 경로가 있는지 검증
>파일이나 디렉토리 상에 어떤 종류의 읽거나 쓰기 작업을 수행하기 전에 경로 존재 여부확인이 필수다. 다음 함수를 사용하여 간단히 해당 작업을 수행 할 수 있다.
```sh
//비동기식
fs.exists(path, callback);
//동기식
fs.exitsSync(path);
//둘다 파일의 경로가 존재할 경우에는 true, 존재하지 않을 경우에는 false값을 리턴하게 된다.
//
//filesystem.js라는 이름의 파일이 존재하는지 확인하려면 비동기 식으로 기능을 구현하려면,
fs.exists('fileSystem.js', function(exists){
    console.log(exists ? "Path Exists" : "Path Does Not Exists");
});
```
### 파일 정보 확인
>대상의 파일 관련 시스템정보('파일크기나 모드','변경 시간','파일 디렉토리 존재여부')등의 기본정보를 확인하는 작업이 있다. 아래의 함수를 사용해 다음의 정보를 얻을 수 있다.
```sh
//비동기식
fs.stat(path, callback);
//동기식
fs.statSync(path);
//다음 함수의 반환 값은 Obcjet값으로 반환이 된다.
```
>>파일시스템의 항목 관련 Stat return object의 속성과 함수
- isFile() : 항목이 파일인 경우 true로 반환
- isDirectory() : 항목이 디렉토리인 경우 true로 반환
- isSocket() : 항목이 소켓인 경우 true로 반환
- dev : 파일이 위치한 곳의 디바이스ID
- mode : 파일 접근 모드 값
- size : 파일 크기 값
- blksize : 파일 저장에 사용된 바이트 단위의 블록 크기 값
- blocks : 파일이 디스크 상에서 차지하는 블록 크기 값
- atime : 마지막으로 파일에 접근한 시간
- mtime : 마지막으로 파일이 변경된 시간
- ctime : 파일이 생성된 시간
>>>//참고// file_state.js ::: 파일 정보 추출을 위한 함수 호출 예제

### 파일 목록 나열
>내 파일과 폴더를 조회하는 방법또한  fs모듈에는 있다. 디렉토리를 지우거나 구조를 동적으로 변경하는 등의 작업을 할 경우에 디렉토리를 목록 조회가 필요하다.
다음 명령 중 하나를 사용해 디렉토리 내 목록을 조회할 수 있다.
```sh
//비동기식
fs.readdir(path, callback);
//동기식
fs.readdirSync(path);
// 객체의 반환 값은 문자열(string value)로 받을 수 있다.
```
>>//참고// file_readdir.js ::: 콜백 체인을 구성해 디렉토리 구조 탐색 및 출력예제

### 파일 삭제
>데이터를 삭제하거나 파일 시스템의 사용공간을 늘리기 위한 목적으로 다음과 같은 기능이 쓰인다.
```sh
// 비동기식
fs.unlink(path, callback);
//동기식
fs.unlinkSync(path);
//
//다음 코드는 비동기식으로 파일 삭제하는 방법
fs.unlink('new.txt', function(err){
    console.log(err ? "File Delete Failed" : "File Deleted");
});
```
### 파일 잘라내기
>파일 잘라내기는 파일 끝 위치를 현재보다 작게 만들어 파일 크기를 줄이는 것을 의미한다. 임시로그 테이터와 가이 중요도가 낮은 데이터 파일이 지속적으로 증가되는 경우, 파일 잘라내기가 필요하다. 파일을 잘라내려면 원하는 푀종 파일 크기를 전달해 아래 fs함수 중 하나를 호출 한다.
```sh
//비동기
fs.truncate(path, len, callback);
//동기
fs.truncateSync(path, len);
```
>>파일을 잘라내기 성공 여부에 따라 true, false의 값을 반환.비동기식에서는 파일을 잘라내기시에 오류 발생 시 콜백 함수로 err값을 전달 받게 된다.
다음 코드 조각은 new.txt 이름의 파일을 0바이트 크기로 잘라내는 과정이다.
```sh
fs.truncate('new.txt', function(err){
    console.log(err ? "File Truncate Failed" : "File Truncated");
});
```
### 디렉토리 추가와 삭제
>가끔은 Node.js 어플리케이션 내에서 파일을 저장할 디렉토리 구조를 만들어야 할 경우가 있다. fs모듈은 필요 시 디렉토리를 추가하거나 삭제할 수 있는 기능을 제공한다.
>>Node.js에서 디렉토리를 추가하려면 다음 fs 호출을 사용한다.
```sh
//비동기식
fs.mkdir(path, [mode], callback);
//동기식
fs.mkdirSync(path, [mode]);
//
//path : 절대/상대 경로 지정
//[mode] : 새로운 디렉토리의 접근 모드를 지정할 수 있다.
//반환값 :  동기식에서는 성공여부에 따라 true, false로 반환된다.
            비동기식에서는 생성 실패 시 콜백함수인 err값을 반환한다.
```
>>아래 코드는 순차 방식으로 서브 디렉토리 생성 방법이다.
```sh
//책에서는 rmdir로 디렉토리 지우기로 나와있다.
fs.mkdir('./data/folderA/folderB/folderD', function(err){
    fs.mkdir('./data/folderA/folderB', function(err){
        fs.mkdir('./data/folderA/folderC/folderE', function(err){
            fs.mkdir('./data/folderA/folderC', function(err){
                 fs.mkdir('./data/folderA', function(err){
                 });
           }); 
        });
    });
});
```
>>Node.js에서 디렉토리를 삭제하려면 절대 경로나 상대 경로를 사용해 아래 함수를 호출한다.
```sh
//비동기식
fs.rmdir(path, callback);
//동기식
fs.rmdir(path)
//path : 절대/상대 경로 지정
//반환값 :  동기식에서는 성공여부에 따라 true, false로 반환된다.
            비동기식에서는 생성 실패 시 콜백함수인 err값을 반환한다.
```
>>mkdir()함수와 같이 부모 디렉토리를 삭제하기 전에 대상 디렉토리를 삭제하도록 한다. 순차적으로 맨 밑 디렉토리부터 지워야 디렉토리가 성공적으로 지워질 수 있다.
```sh
fs.rmdir('./data/folderA/folderB/folderC', function(err){
    fs.rmdir('./data/folderA/folderB', function(err){
        fs.rmdir('./data/folderD', function(err){
        });
    });
    fs.rmdir('./data/folderA/folderC', function(err){
        fs.rmdir('./data/folderE', function(err){
        });
    });
});
```


### 파일 이름과 디렉토리 이름을 변경
>새로운 데이터를 생성하거나 이전 데이터를 저장, 사용자 변경 등을 위해 Node.js 어플리케이션 내에서 파일이나 폴더의 이름 변경이 필요한 경우가 있다. 파일이나 폴더 이름 변경을 위해선 아래 fs함수를 호출한다.
```sh
fs.rename(oldPath, newPath, callback); //비동기식
fs.renameSync(oldPath, newPath); //동기식
//oldPath : 현재 변경하고자하는 디렉토리 및 폴더 지정 (파일인 경우는 확장자까지)
//newPath : 변경위치 및 파일명 지정
//성공 여부의 따라 true, false값으로 반환
//비동기식에서는 실패한 경우 에러 값과 함께 전달
//
//다음 식은 old.txt의 이름은 new.txt로 변경하고 testDir를 renameDir로 변경한다.
fs.rename('old.txt', 'new.txt', function(err){
    console.log(err ? "Rename Failed" : "File Renamed");
});
fs.rename('testDir', 'renameDir', function(err){
    console.log(err ? "Rename Failed" : "File Renamed");
});
```
