/**
 * Created by scottmoon on 6/27/15.
 */

function logCar(logMsg, callback) {
    process.nextTick(function () {
        callback(logMsg);
    });
}

var cars = ["Ferrari", "Porsche", "Bugatti"];

for (var idx in cars) {

    var message = "Saw a " + cars[idx];
    (function (msg) {
        logCar(msg, function () {
            console.log("Closure Callback: " + msg);
        });
    })(message);
}

