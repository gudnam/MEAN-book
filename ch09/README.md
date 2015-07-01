# Node.js의 다중 프로세서를 사용한 어플리케이션 확장
단일 스레드를 사용한 어플리케이션이 Node.js 에서는 더 효율적이고 더 빠르게 동작한다. 하지만, 대부분의 서버에서는 다중 프로세서가 있고, 다중 프로세서의 장점을 활용할 수 있게 Node.js 어플리케이션을 조절할 수 있다. Node.js는 주 어플리케이션을 여러 프로세스로 분리시킬 수 있고, 각 프로세스는 주 어플리케이션을 포함한 서로에 대해 병렬로 처리된다.
>다중 프로세서를 활용하기 위해 Node.js는 세 가지 특징적인 모듈을 제공한다.
- process Module :
    - 동작중인 프로세스에 접근할 수 있는 권한을 제공
- child_process Module : 
    - 자식 프로세스(child process)를 생성하고 서로 통신할 수 있게 한다.
- cluster Module :
    - 동일한 포트를 공유하는 클러스터로 묶인 서버 클러스터를 구현하고 프로세스를 입력받아 동시에 처리한다.
---
## process 모듈 이해
process 모듈은 require()를 사용하지 않고도 Node.js 어플리케이션에 접근 할 수 있는 전역 객체이다. 모듈은 근본적인 하드웨어 아키텍쳐에 대한 정보뿐 아니라 동작중인 프로세스에 접근할 수 있는 권한을 제공한다.

###입출력 파이프 처리 이해하기
stdin과 stdout, stderr, stdin 프로세스가 일반적으로 콘솔 표준 입력 파이프이기 때문에 process 모듈은 표준 입출력 파이프에 대한 접근을 제공한다. 즉, 콘솔에서 입력 받기위한 코드는
```sh
process.stdin.on('data', function(data) {
    console.log('Console Input: ' + data);
});
```
위의 명령어를 입력 시킨 js파일을 Node로 실행하고 콘솔창에 데이터를 입력하면 데이터가 위의 코드로 전달이 된다. 예를들어
```sh
> Some data
> Console Input : Some data
```
process 모듈은 stdout, stderr 속성은 writable 스트림으로 상황에 따라 적절히 처리가 된다.

###프로세스 시그널 이해
process 모듈의 큰 특징은 운영체제가 프로세스에 전달하는 시그널(signal,신호)을 처리하기 위한 리스너를 등록할 수 있다는 점이다. 따라서 프로세스가 멈추거나 종료하기 전에 비워내는 등의 특정 액션을 수행할 때 유용하게 사용된다.
```sh
// 프로세스 시그널에 등록하려면 on(event, callback) 함수를 사용한다.
// 예를 들어 SIGBREAK 이벤트에 이벤트 핸들러를 등록하려면,
process.on('SIGBREAK', function(){
    console.log('Got a SIGBREAK');
});
```
> Node.js 프로세스로 보낼 수 있는 시그널 이벤트
- SIGUSR1 : Node.js 디버거가 시작되면 발생한다. 리스너를 등록할 수 있지만, 시작된 디버거는 종료할 수는 없다.
- SIGPIPE : 프로세스가 반대쪽에서 연결된 과정 없이 파이프에 쓰려고 할 때 발생
- SIGHUP : 윈도우OS 환경이나 유사한 조건의 다른 플랫폼에서 콘솔 윈도우가 닫힌 경우 발생.이벤트가 발생하면 약 10초 뒤에 윈도우가 Node.js를 종료한다.
- SIGTERM : 요청이 프로세스가 종료하면 발생한다. 윈도우OS 환경에서는 지원하지 않는다.
- SIGINT : 멈춤(break)이 프로세스로 전달되면 발생. Command(Ctr)+C 눌렀을때와 같은 상황.
- SIGBREAK : 윈도우OS 환경에서 Ctrl + Break가 눌리면 발생한다.
- SIGINCH : 콘솔의 크기가 변경됐을 때 발생한다. 윈도우OS 환경에서는 콘솔에 쓰려고 할 때나, 커서를 움직였을때, 미처리모드(rea mode)에서 읽을 수 있는 TTY가 사용된 경우에만 발생한다.
- SIGKILL : 프로세스가 종료(kill)되면 발성한다. 리스너를 등록할 수 없다.
- SIGSTOP : 프로세스가 멈추면(stop) 발생한다. 리스너를 등록할 수 없다.

###process 모듈로 하는 프로세스 실행 제어
process 모듈은 프로세스의 실행을 일부 제어할 수 있게 한다. 주요 예를 들면 현재, 프로세스를 중단시키고, 또 다른 프로세스를 종료하고, 이벤트 큐에 동작을 등록시킨다.
```sh
//예를 들어 Node.js 프로세스를 종료시키고 싶다면
process.exit(0);
```
> process 모듈에서 사용 가능한 프로세스 제어 함수 목록
- abort() :
    - 현재 Node.js 어플리케이션이 abort 이벤트를 발생시키고 종료시킨 후 메모리 코어(memory core)를 생성한다.
- exit([code]) :
    - 현재 Node.js 어플리케이션 종료하고 정의된 코드를 반환한다.
- kill(pid, [signal]) :
    - 운영체제가 지정된 pid의 프로세스에 종료 시그널(kill signal)을 보낸다.
    - 기본 signal 값은 SIGTERM이지만, 수동으로 다른 다른 값으로 지정할 수 있다.
- nextTick(callback) :
    - Node.js 어플리케이션의 큐(Queue)에 callback 함수를 등록 시킨다.

---

###process 모듈의 정보 가져오기
process 모듈은 동작하는 프로세스 및 시스템 아키텍쳐에 관한 풍부한 정보를 가지고 있다. 얻어진 정보는 어플리케이션을 구현할 때 유용하게 사용된다.
> 예를 들어 process.pid 속성은 프로세스의 ID값을 전달하고 어플리케이션에서는 이 ID값을 활용 할 수 있다.
> process 모듈을 통해 접근 가능한 속성과 함수 및 반환 값이다.
- version :
    - Node.js의 버전
- versions :
    - 요청받은 모듈과 Node.js 어플리케이션의 버전을 포함하느 객체를 제공
- config : 
    - 현재 노드 실행파일을 컴파일하는데 사용된 환경 구성 선택 사항을 포함한다.
- argv :
    - Node.js 어플리케이션을 시작하는 사용되는 명령 인자를 포함한다.
    - 첫번째 요소는 node, 두번째 요소는 주요 자바스크립의 파일 경로다.
-  execPath :
    - Node.js가 실행된 위치에 절대 경로값이다.
- execArgv :
    - 어플리케이션을 시작할 때 사용된 노드에 특화된 명령 행 선택 사항이다.
- chdir(directory) :
    - 어플리케이션을 동작 중인 디렉토리를 변경한다. 어플리케이션이 시작한 후에 로드되는 환경 파일을 제공한 경우 유용하다.
- cwd() :  
    - 프로세스가 현재 동작중인 디렉토리르 반환한다.
- env :
    - 프로세스 환경 구성에 명세된 키/값 쌍을 포함한다.
- pid : 
    - 현재 프로세스의 ID이다.
- title :
    - 현재 동작중인 프로세스 타이틀이다.
- arch : 
    - 현재 동작중인 프로세스의 아키텍쳐다 (예, x64 | ia32 | arm)
- platform :
    - OS 플렛폼이다
- memoryUsage() :
    - Node.js 프로세스의 현재 메모리 사용량을 보인다. util.inspect() 함수를 사용하면 이객체를 읽을 수 있다.
    - 예, console.log(util.inspect(process.memoryUsage()));
- maxTickDepth :
    - 블로킹(blocking) 입출력이 처리되기 전에 동작하는 nextTick()으로 스케쥴링된 이벤트의 최대 개수이다. 입출력 프로세스가 기아 상태에 빠지는 것을 방지하기 위해 이 값을 산정하는것이 필요하다.
- uptime() :
    - Node.js 프로세서가 동작한 초(seconds) 단위 시간을 포함한다.
- hrtime() :
    - 고해상도(high-resolution)의 시간을 튜플(tuple)인 array[seconds, nanoseconds]에 값을 반환한다. 그래뉼러 타이밍 메커니즘(granular timing mechanism)을 구현할 때 이 값이 필요하다,
- getgid() :
    - 포식스(POSIX)플렛폼에서, 프로세스의 그룹 ID를 숫자형으로 반환한다.
- setgid(id) :
    - 포식스(POSIX)플렛폼에서, 프로세스의 사용자 ID를 숫자/문자형으로 지정한다.
- getuid() :
    - 포식스(POSIX)플렛폼에서, 프로세스의 사용자 ID를 숫자/문자형으로 반환한다.
- setuid(id) :
    - 포식스(POSIX)플렛폼에서, 프로세스의 사용자 ID를 숫자/문자형으로 지정한다.
- getgroups() :
    - 포식스(POSIX)플렛폼에서, 그룹 ID들을 배열로 반환한다.
- setgroups(groups) :
    - 포식스(POSIX)플렛폼에서, 보조 그룹 ID를 설정한다.
    - Node.js에서 이 메소드를 호출하려면 root권한이 필요하다.
- initgroups(user, extra_group) :
    - 포식스(POSIX)플렛폼에서, /etc/group 의 정보를 바탕으로 그룹접근 목록을 초기화한다. 
    - Node.js에서 이 메소드를 호출하려면 root권한이 필요하다.

>  //참고// process_info.js :: process 모듈을 사용해 프로세스와 시스템정보의 접근

## 자식 프로세스 구현
Node.js 어플리케이션에서 서버의 다중 프로세서를 효율적으로 활요하려면 작업을 자식 프로세스에 분배해야 한다. child_process 모듈을 사용해 자식 프로세스를 생성하거나 다른 프로세스의 작업을 실행할 수 있다.
>자식 프로세스는 서로간에 전역 메모리나 부모 프로세스에 직접 접근이 불가능하르며 어플리케이션이 병렬적으로 수행되도록 디자인해야 한다.

---
### ChildProcess 객체 이해
child_process 모듈은 ChildProcess라는 새로운 클래스를 제공한다. ChildProcess는 부모에서 접근 가능한 자식 프로세스로 표현된다. ChildProcess를 사용해 자식 프로세스를 실행한 부모 프로세스에서 자식 프로세스를 제어하고, 종료하고, 메세지를 전달할 수 있다.
>process 모듈 또한 ChildProcess 객체다. 그렇기 때문에 부모 모듈에서 process에 접근하면  부모 ChildProcess 객체고, 자식 프로세스에서 process에 접근하면 ChildProcess객체이다.

자식 프로세스 종료나 부모에게 메시지 전송 시 발생하는 이벤트를 처리하기 위한 핸들러를 구현해야한다.
>ChildProcess 객체가 방출하는 이벤트
- message :
    - ChildProcess 객체가 send() 함수를 통해 데이터 전송 시 발생.
    - 이벤트 리스너는 보내진 데이터를 읽기 위한  callback을 구현해야한다.
- error :
    - worker에 오류가 발생 시 방출된다.
    - 핸들러는 error 객체를 유일한 전달인자로 받는다.
- exit :
    - worker 프로세스 종료 시 발생한다.
    - 핸들러는 code와 signal을 전달 받는다.
    - code에는 exit code를 지정
    - signal에는 부모 프로세스에 의해 kill된 과정에 받은 시그널을 전달한다.
- close :
    - worker 프로세스의 모든 표준 입출력 스트림 종료 시 발생한다.
    - 다중 프로세스가 같은 stdio 스트림을 공유할 수 있기 때문에 exit와 다르다.
- disconnect :
    - worker에서 diconnect() 호출 시 발생

부모 프로세스에서 자식 프로세스로 객체를 전달하는 방법은
```sh
child.send({cmd: 'command data'});
```
함수들을 사용해 자식 프로세스를 종료하거나 연결끊기, 메세지 보내기가 가능하다.
>ChildProcess 객체의 함수
- kill([signal]) :
    - 운영체제에서 자식 프로세스에 kill 시크널을 전달하도록 유발한다.
    - 기본 시그널은  SIGTERM 이지만 다른 시그널을 지정할 수 있다.
- send(message, [sendHandle]) :
    -  처리할 메세지를 전달.
    -  메세지는 문자열이나 객체형태이다.
    -  sendHandle을 통해 클라이언트에 TCP Server나 Socket 객체를 보낼 수 있고, 이를 통해 클라리언트 프로세스가 동일한 포트나 주소를 공유할 수 있다.
- disconnect() :
    - 부모와 자식 프로세스의 프로세스간 통신(IPC) 채널을 닫고, 부모와 자식간의 프로세스의 connected 플래그를 false로 설정한다.
    
>ChildProcess 객체에서 접근 가능한 속성
- stdin : 입력 Writable 스트림
- stdout : 표준 출력 Readable 스트림
- stderror : 오류에 대한 표준 출력 Readable 스트림
- pid : 프로세스 ID
- connected : diconnect() 호출 후에는 'false'로 설정됨. false인 경우에는 자식프로세스에서 부모 프로세스로 메세지를 전달이 불가능.

---
###exec()을 사용해 다른 프로세스의 시스템 명령을 실행
Node.js 프로세스에서 다른 프로세스에 작업을 추가하기 위한 가장 간단한 방법은 exec() 함수를 사용해 서브 셀(subshell)에서 시스템 명령을 실행하는 것이다. exec() 함수는 콘솔 프롬프트에서 실행 가능한 모든 것(실행 바이너리, 셀 스크립트, 파이썬 스트립트, 배치 파일)을 실행 시킬 수 있다.
>실행 시, exec()  함수는 시스템 서브셀을 생성한 후 콘솔 프롬프트에서 실행하는 것과 같이 셀 상에서 멍령을 실행한다. 이 방식은 시스템 환경변수 접근과 같은 콘솔 셀에서의 기능을 사용할 수 있는 장점을 가진다.
>>exec() 함수의 문법은,
```sh
child_process.exec(command, [options], callback);
//return Object : ChildProcess
// command : 서브셸에서 수행될 명령을 지정하는 문자열
// option : 현재 작업 중인 디렉토리와 같은, 명령 실행 시 사용되는 설정값을 지정하는 객체
// callback : (error, stdout, stderr)를 사용한다.
//          : error : 실행 중 발생한 오류를 전달하는 error 객체를 받는다.
//          : stdout , stderror 는 실행한 멍령의 결과 값을 포함한 Buffer객체
```
>exec()와 exccFile() 함수에 설정 가능한 선택사항
- cwd : 자식 프로세스 내에서 실행 할 현재 작업 디렉토리 지정
- env : 환경 key/value 쌍으로, property:value를 지정하는 객체이다.
- encoding : 명령의 결과를 저장할 출력 버퍼에 사용되는 인코딩 형태를 지정
- maxBuffer : stdout과 stderr의 출력 버퍼의 크기를 지정. (기본값:200x1024)
- timeout : 부모 프로세스가 완료 되지 않은 자식 프로세스를 죽이기 전에 대기하는 시간(밀리초)을 지정한다. (기본값은 0 , 즉시 죽인다.)
- killSignal :  자식 프로세스 종료 시 사용하는 kill 시그널을 지정한다.(기본값 SIGTERM)

> //참고// child_exec.js ::: 다른 프로세스 내에서 시스템 명령 실행


### spawn()을 사용해 다른 Node.js 객체에서 프로세스를 생성
Node.js 프로세스에서 새로운 프로세스를 추가를 위한 좀 더 복잡한 방법으로는 다른 프로세스를 스폰(spawn/산란)하는 방법이 있다. 스폰은 새로운 프로세스와 기존 프로세스간에 stdio, stdout, stderr 파이프를 만든 후 spawn() 함수를 사용해 새로운 프로세스의 파일을 실행한다. 이방식은 exec()을 이용하는 방법에 비해 무겁긴하지만 많은 장점을 가진다.

>exec() / execFile() 과 spawn()의 차이점은,
    - stdin 설정이 가능하다
    - spstdout/stderr는 부모 프로세스의 Readable 스트림을 쓴다.
    - > exec()/execFile()은 버퍼 출력을 읽기 전에 완료 되야하지만, spawn() 프로세스의 결과 데이트럴 쓰여지는 동시에 읽을 수도 있다.
    
spawn() 함수는 ChildProcess 객체를 반환하고 사용법은,
```sh
child_process.spawn(command, [args], [options]);
//command : 실행될 명령을 지정하는 문자열
//args : 실행 명령에 전달할 명령 행 전달인자 배열 지정
//options : 현재 작업 디렉토리와 같이 , 명령 실행 시 사용할 설정을 지정하는 객체
```
callback 전달인자는 exec()/execFile()과 동일하다
```sh
// callback : (error, stdout, stderr)를 사용한다.
//          : error : 실행 중 발생한 오류를 전달하는 error 객체를 받는다.
//          : stdout , stderror 는 실행한 멍령의 결과 값을 포함한 Buffer객체
```
>spawn() 함수에서 'options'에서 사용할 수 있는 사항
- cwd : 자식 프로세스 내에서 실행 할 현재 작업 디렉토리 지정
- env : 환경 key/value 쌍으로, property:value를 지정하는 객체이다.
- detached : 
    - true로 설정하면, 자식 프로세스를 새로운 프로세스 그룹의 리더로 만들고 부모 프로세스 종료 시에도 프로세스가 지속되도록 허용한다.
    - child.unref()를 같이 사용해 부모 프로세스가 자식 프로세스의 종료를 기다리지 않도록 만들어야 한다.
- uid : 포식스(POSIX)프로세스의 프로세스 사용자 식별자를 지정한다.
- gid : 포식스(POSIX)프로세스의 프로세스 그룹 식별자를 지정한다.
- stdio :
    - 자식 프로세스의 stdio 설정 ([stdin, stdout, stderr])를 정의한다.
    - 기본설정 : Node.js[stdin, stdout, stderr]를 위해 파일 디스크립터 [0,1,2]를 연다.
    - 문자열은 각 입/출력력 스트림 설정의 정의 한다.
    - 예: ['ipc', 'icp', 'icp']
    - 'pipe' : 자식과 부모 프로세스 사이에 파이프를 생성. 부모는 ChildProcess.stdio[fd]를 사용해 파이프에 접근 가능하다. fd는 [stdin, stdout, stderr]를 위한 파일 디스크립터 [0,1,2]이다.
    - 'ipc' : 부모와 자식 프로세스 간에 메시지/파일 디스크립터를 전달하기 위한 IPC 채널을 생성한다. send()함수를 사용하여 전달한다.
    - 'ignore' : 자식 프로세스에 파일 디스크립터를 설정하지 않는다.
    - Stream : 부모 프로세스에 정의된 Readble/Writable 스트림 객체를 지정한다. 스트림의 파일 디스크립터는 자식 프로세스의 중복되기 때문에 부모나 자식 프로세스 간에 스트림이 가능하다.
    - File descriptor integer : 사용할 파일 디스크립터의 정수 값을 지정한다.
    - null, undefined : [stdin, stdout, stderr]값으로 기본 값 [0,1,2]를 사용한다.
