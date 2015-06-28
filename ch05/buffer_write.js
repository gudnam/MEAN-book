/**
 * Created by scottmoon on 6/28/15.
 */

buf256 = new Buffer(256);
buf256.fill(0);
buf256.write("Add some text");
console.log(buf256.toString());


// write 같은 경우는 "적용할 텍스트" , 바꿀 위치(origin length), 기존텍스트의 length 범위
// 참고로 한글은 256에서는 안됨.
buf256.write("more text", 9, 5);
console.log(buf256.toString());

buf256[18] = 43;
console.log(buf256.toString());