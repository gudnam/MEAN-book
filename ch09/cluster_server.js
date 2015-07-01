/**
 * Created by scottmoon on 7/1/15.
 */


var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {

    cluster.on('fork', function (worker) {
        console.log('Worker ' + worker.id + ' created');
    });

    cluster.on('listening', function (worker, address) {
        console.log("Worker " + worker.id + "is listening on " + address.address + ":" + address.port);
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log("Worker " + worker.id + " Exited");
    });

    cluster.setupMaster({
        exec: 'cluster_worker.js'
    });

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    Object.keys(cluster.workers).forEach(function (id) {
        cluster.workers[id].on('message', function (massage) {
            console.log(massage);
        });
    });

}

