/**
 * Created by scottmoon on 7/2/15.
 */

var util = require('util');
var events = require('events');

function Writer() {
    events.EventEmitter.call(this);
}

// inherits() 함수를 사용해 events.EventEmitter의 인스턴스임을 확인한다.
util.inherits(Writer, events.EventEmitter);
Writer.prototype.write = function (data) {
    this.emit("data", data);
};

var w = new Writer();
console.log(w instanceof events.EventEmitter);

//Writer.super_ 값이 eventEmitter라는게 확인이 되었다.
console.log(Writer.super_ === events.EventEmitter);

w.on("data", function (data) {
    console.log('Received data: "' + data + '"');
});
w.write("Some Data!");