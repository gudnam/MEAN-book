/**
 * Created by scottmoon on 6/28/15.
 */


var stream = require('stream');
var util = require('util');

util.inherits(Duplexer, stream.Duplex);

function Duplexer(opt) {
    stream.Duplex.call(this, opt);
    this.data = [];
}

Duplexer.prototype._read = function readItem(size) {
    var chunk = this.data.shift();
    if (chunk == "stop") {
        this.push(null);
    } else {
        if (chunk) {
            this.push(chunk);
        } else {
            setTimeout(readItem.bind(this), 500, size);
        }
    }
};

Duplexer.prototype._write = function (data, encoding, callback) {
    this.data.push(data);
    callback();
}

var d = new Duplexer();

d.on('data', function (chunk) {
    console.log('read : ', chunk.toString());
});

d.on('end', function () {
    console.log('Message complete');
});

d.write("I think, ");
d.write("therefore ");
d.write("I am. ");
d.write("Rene Descartes");
d.write("stop");