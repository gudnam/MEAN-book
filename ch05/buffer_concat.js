/**
 * Created by scottmoon on 6/28/15.
 */

var af = new Buffer("African Swallow?");
var eu = new Buffer("Europian Swallow?");
var question = new Buffer("Air Speed Valocity of an ");
console.log(Buffer.concat([question, af], question.length + af.length).toString());
console.log(Buffer.concat([question, eu]).toString());
