/**
 * Created by scottmoon on 6/28/15.
 */

var alphabet = new Buffer('abcdefghijklmnopqrstuvwxyz');
console.log(alphabet.toString());


// 전체 버퍼 복사
var blank = new Buffer(26);
blank.fill();
console.log("Blank : ", blank.toString());
alphabet.copy(blank);
console.log("Blank : " + blank.toString());

// 버퍼의 일부분 복사
var dashes = new Buffer(26);
dashes.fill('-');
console.log("Dashes: " + dashes.toString());
alphabet.copy(dashes, 10, 10, 15);
console.log("Dashes: " + dashes.toString());

// 버퍼의 특정부분 기준삼아 복사
var dots = new Buffer(alphabet.length);
dots.fill('.');
console.log("dots: " + dots.toString());

for (var i = 0; i < dots.length; i++) {
    if (i % 2) {
        dots[i] = alphabet[i];
    }
}
console.log("dots: " + dots.toString());