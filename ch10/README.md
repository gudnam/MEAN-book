# 추가 Node.js 모듈 사용
Node.js에 이미 설치된 유용한 추가 모듈들을 소개하는 페이지이다.
    - os 모듈은 어플리케이션 구현 시 유용한 운영 체제의 단면을 보여준다.
    - util 모듈은 동기화 출력이나 문자열 가공방법, 상속 확장(inheritance enhancements) 등등
    - dns 모듈은 DNS 조회(lookup)를 수행, Node.js 어플리케이션의 룩업 값을 다시 역반환.
    
## os 모듈 사용하기
os 모듈은 운영체제의 정보를 얻어오는 매우 유용한 함수 셋트를 제공한다.
>예를 들어, 운영체제로부터 전달받은 어떤 스트림(steam)에서 데이터를 접근하려면, os.endianness()를 호출해 운영체제가 Big endian/Little endian 형식인지 먼저 파악한 후, 읽기와 쓰기 함수를 적절하게 사용한다.
> os 모듈에서 호출 가능한 메소드
- tmpdir() :
    - 운영체제의 임시 디렉토리의 경로를 문자열로 반환한다. 임시 파일을 저장하고 추후 삭제하려고 할 때 유용하게 사용된다.
- endianess() :
    - 머신의 아키텍처에 따라 빅/리틀 엔디언 여부를 BE/LE로 반환
- hostname() :
    - 머신에 정의된 호스트 이름을 반환한다.
    - 호스트 이름을 요구하는 네이트워크 서비스를 구현할 때 필요하다.
- type() :
    - 운영체제의 형식을 문자열로 반환한다.
- platform() :
    - 플랫폼을 문자열로 반환 (darwin, win32, linux, FreeBSD);
- arch() :
    - 플랫폼의 아키텍처를 반환한다. (x64,x86)
- release() :
    - 운영체제의 릴리즈 버전값을 반환한다.
- uptime() :
    - 운영체제의 동작 시간을 초 단위(seconds) 타임스탬프로 반환한다.
- loadavg() :
    - 유닉스 기반 시스템에서 (1, 5, 15)분에 대한 시스템의 로드 값 (load value)을 포함하는 배열을 반환한다.
- totalmem() :
    - 시스템의 메모리를 정수형 바이트(bytes)로 반환한다.
- freemem() :
    - 시스템의 자유 메모리(free memory)를 정수형 바이트(bytes)로 반환한다.
- cpus() :
    - CPU 모델 및 speed, times를 나타내는 객체의 배열 반환
    - {model:%s, speed:%d , times{user: userId, nice:%d, sys:%d, idle: %d, irq:%d}}
- networkInterfaces() :
    - 시스템에 연결된 각 네트워크 인터페이스 주소들이 address 및 family를 나타내는 객체의 배열을 반환
- EOL :
    - 운영 체제에 적합한 개행문자(\n,\r\n)를 포함한다. 플랫폼간에 호환성을 유지하는 어플리케이션에 문자열 데이터를 처리할 때 유용하게 사용된다.
    
> //참고// os_info.js :: os모듈이 제공하는 메소드 호출

    

## util 모듈 사용
util 모듈은 일종의 잡동사니 모듈이다. 문자열을 가공하거나 객체를 문자열로 변환하고, 객체 형식을 체크하고, 출력 스트림에 동기식으로 데이터를 쓰는(synchronous writes)것 뿐만 아니라 객체의 상속 확장을 지원하는 유틸리티 함수를 제공한다.

### 문자열 가공
util.format( formatStr ,[...]);
>formatStr은 가공 형식 문자열(format string)이고, [...]는 추가 될수 있는 인자이다.
- 각 대체 문자는 '%문자'로 시작
- 최종적으로 대응되는 전달인자에 의해 지정된 문자열로 변환한다.
- 첫번째 대체문자는 두 번째 전달인자가 적용, 그 이후는 동일한 방식으로 적용된다.
- 다음과 같은 대체 문자를 사용할 수 있다.
    - %s : 문자형을 제외된다.
    - %d : 숫자형(정수/실수)을 정의한다.
    - %j : 문자형으로 변환 가능한 JSON 객체를 정의한다.
    - % : 비어있다면, 대체문자로 동작하지 않는다.

>format()을 사용할 때 다음을 주의해야한다.
- 대체문자만큼 전달인자가 존재하지 않다면, %s와 같은 대체 문자는 변환되지 않는다.
    - 예를들면, 다음과 같다.
    - util.format('%s = %s', 'ITem1') // ITem1 : %s(비어있음)
- 대체 문자보다 전달인지가 더 많다면, 추가로 명시된 전달인자들은 공백 구분자로 연결해 하나의 문자열로 반환된다.
    -예를들면, 다음과 같다.
    - util.format('%s = %s', 'Item1', 'Item2', 'Item3'); // ITem1 = ITem2 ITem3
- 첫 번째 전달인자가 가공 형식 문자열이 아니라면, util.format()은 각 전달인자를 문자열을 변환하고 공백 구분자로 연결해 하나의 문자열로 생성해 반환한다.
    - util.format(1,2,3); // 1 2 3
    
---

### 객체 형식 확인
종종 어떤 명령에 의해 돌려받은 객체가 어떤 형식인지 확인하는 것이 필요하다. 객체의 형식을 확인하는 방법은 여러 가지가 있다.
> 객체의 형식을 비교하고 true,false로 반환하는 isinstanceof 연산자를 사용하는 것이다.

>예를 들면 다음과 같다.
- ([1,2,3] isinstance of Array) // return 'true'

>util 모듈은 객체가 Array 혹은, RegExp, Date, Error 객체 형식인지 확인하기 위해 isArray(object) 및 isRegExp(object), isDate(object), isError(object)와 같은 편리한 함수를 제공한다.
- (util.isArray([1,2,3])) // return 'true'

---


### 출력 스트림에 동기화해서 쓰기
stdout, stderr 출력 스트림에 데이터를 동기화모드로 쓸 수 있다.
> 동기화 쓰기는 데이터를 다 쓸 때까지 프로세스를 블록킹(blocking)하는 것을 의미한다. 따라서 데이터를 쓰는 동안 시스템은 데이터를 변경하는 동작을 할 수 없다는 것을 보장한다.

>동기화 데이터 쓰기를 사용하려면 쓰기 동작을 완료할 때까지 프로세스를 블로킹하는 함수를 사용한다. 예를들어,
    - util.debug(string) : string을 전달받아 stderr 에 값을 쓴다.
    - util.error([...]) : 다중 전달인자를 전달받아 stderr에 값을 쓴다.
        - 예를 들어,
        - util.error(errorCode, "errorname");
    - util.puts([...]) : 다중 전달인자를 전달받아 stdout에 값을 쓴다.
    - util.print([...]) : 다중 전달인자를 받아 각각을 문자형을 변환하고 stdout에 값을 쓴다.
    - util.log(string) : string으로 전달받아 타임스탬프와 함께 stdout에 값을 쓴다.
        - 예를 들어,
        - util.log('Some massage.'); // 30 Nov 13:26:20 - Some message.
        
     
---
     
### 자바스크립트
종종, 특히 디버깅을 할 때 자바스크립트 객체를 문자열(string)로 표현하기 위해 변환이 필요한 경우가 있다. util.inspect() 함수는 객체를 점검하고 객체의 값을 문자열로 표현해 반환한다.
- 다음은 inspect() 함수의 문법이다.
```sh
util.inspect(object, [options])
//object : 문자열로 변환해야 할 자바스크립트 객체를
//options : 밑에 표에 나열된 옵션값을 사용할 수 있다.
```
>util.inspect에서 사용가능한 옵션값
- showHidden :
    - true로 설정되면 객체의 셀 수 없는(non-enumerable)속성도 문자열로 변화 된다.
    - 기본값 : false
- depth : 
    - 객체를 문자열로 변환할 떄 몇 번을 재귀해 검사할지를 결정한다.
    - 이 값은 무한대로 반혹 할 수 있는 위험을 방지하고  CPU 회전을 많이 소비하는 복잡한 객체를 검사할 때 유용하다.
    - 기본값 : 2 (null로 설정하면 무한루프가 걸린다.)
- colors :
    - true로 설정하면 결과 값은 ANSI 컬러 코드로 스타일을 입혀 출력된다.
    - 기본값 : false
- customInspect :
    - false로 설정하면 사용자가 검사할 객체에 생성한 inspect() 함수는 변환 시 호출되지 않는다.
    - 기본값 : true
> 출력 결과를 원하는 대로 생성하기 위해 객체에 직접 inspect() 함수를 정의할 수 있다.
```sh
// 이 코드는 first와 last 속성을 갖는 객체를 생성하고, name속성만 출력하는 inpect()를 정의한다.
var obj = {
    first : 'Brad',
    last : 'Dayley'
};
obj.inspect = function(depth) {
    return '{ name : "'+ this.first +" "+ this.last + '" }';
};
console.log(util.inspect(obj));
// log :: { name : "Brad Dayley" }
```

---

### dns 모듈 사용
Node.js 어플리케이션에서 DNS 도메인 이름 및 도메인 룩업(Lookup), 룩업의 역변환(Reverse)등을 실행하고 싶다면, dns 모듈이 유용하다.
> DNS를 룩업할 때 도메인 네임 서버에 접속하고 특정 도메인 이름에 대한 레코드 요청을 보낸다. 룩업 역변환 시에는 도메인 네임 서버에 접속해 IP 주소와 매치되는 DNS이름을 요청한다.

> dns 모듈은 필요한 대부분의 룩업 관련 기능을 제공한다.

> dns 모듈에서 호출할 수 있는 메소드
- lookup(domain, [family], callback) :
    - domain을 가져온다.
    - family : 4, 6, null 이다.
        - 4라면 첫 번째로 찾은 A(IPv4) 레코드이다.
        - 6이라면 첫 번째로 찾은 AAAA(IPv6) 레코드이다.
        - null이라면, 둘다 가져온다.
        - callback(err, address[array value]) 이다
- resolve(domain, [rrtype], callback) :
    - domain을 rrtype으로 정의된 레코드 배열로 가져온다.
        -예를 들면,
        - A : IPv4 주소(기본값)
        - AAAA : IPv6 주소
        - MX : 메일 교환 레코드 (Mail Exchange records)
        - TXT : 텍스트 레코드
        - SRV : SRV 레코드
        - PTR : 역변환 룩업 IP(Reverse IP lookups)
        - NS : 네임서버 레코드
        - CNAME : '공인된 이름 레코드' (Canonical name records)
        - callback(err, address[array value])
- resolve4(domain, callback) :
    - dns.resolve() 와 같지만 A 레코드에서만 사용.
- resolve6(domain, callback) :
    - dns.resolve() 와 같지만 AAAA 레코드에서만 사용.
- resolveMx(domain, callback) :
    - dns.resolve() 와 같지만 MX 레코드에서만 사용.
- resolveTxt(domain, callback) :
    - dns.resolve() 와 같지만 TXT 레코드에서만 사용.
- resolveSrv(domain, callback) :
    - dns.resolve() 와 같지만 SRV 레코드에서만 사용.
- resolveNs(domain, callback) :
    - dns.resolve() 와 같지만 NS 레코드에서만 사용.
- resolveCname(domain, callback) :
    - dns.resolve() 와 같지만 CNAME 레코드에서만 사용.
- reverse(ip, callback) :
    - IP 주소값에 대해 역변환 룩업을 수행.
    - callback(error, domains[array])

>//참고// dns_lookup.js :: 도메인과 IP주소에 대해 룩업과 역변환 룩업을 수행

### 기타 객체의 기능들을 상속
util 모듈을 사용하면 util.inherits() 메소드를 제공해 기타 객체의 prototype 메소소드를 상속받는 객체를 생성할 수 있다. 새 객체를 생성할 때 prototype 메소드는 자동 적용된다.
> 사실 직접 정의한 Readable / Writable 스트림을 생성할 때 이미 이전장에서 다루었다.
> util.inherits() 사용 문법은 다음과 같다
```sh
- util.inherits( constructor, superConstructor );
// constructor : prototype의 superConstructor로 설정. 새로운 객체가 생성될 때 실행
// superConstructor : constructor.super_ 속성을 사용하면 직접 생성한 객체의 생성자에서 접근할 수 있다.
```

>//참고// util_inherit.js ::: ingerits()를 사용해 event.EventEmitter의 프로토타입을 상속

---

## 요약
os 모듈은 운영체제 형태 및 번전, 플랫폼 아키텍쳐, 프로그래밍 정보(예, 자유메모리 및 임시폴더 위치, 개행 문자 등)를 알려준다. util모듈은 Node.js의 잡동사니 라이브러리로 동기화 쓰기 및 문자열 가공, 형식 검사 등에 쓰이는 메소드를 제공한다.
> dns 모듈은 Node.js 어플리케이션에서 DNS 룩업 및 역변환 룩업을 허용한다.

