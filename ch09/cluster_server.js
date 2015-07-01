/**
 * Created by scottmoon on 7/1/15.
 */


var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    // 클러스터 worker의 이벤트 등록
    cluster.on('fork', function (worker) {
        console.log('Worker ' + worker.id + ' created');
    });

    cluster.on('listening', function (worker, address) {
        console.log("Worker " + worker.id + "is listening on " + address.address + ":" + address.port);
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log("Worker " + worker.id + " Exited");
    });

    //cluster.on('online', function(worker) {
    //    console.log("Yay, the worker responded after it was forked");
    //});
    //
    //cluster.on('disconnect', function(worker) {
    //    console.log('The worker #' + worker.id + ' has disconnected');
    //});

    // .setupMaster()로 실행할 워커 파일 지정
    cluster.setupMaster({
        exec: 'cluster_worker.js'
    });


    // .fork() 호출을 통해 worker 생성
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }


    // 호출로 생성된 워커에 각각 message 이벤트 핸들러 등록
    Object.keys(cluster.workers).forEach(function (id) {
        cluster.workers[id].on('message', function (massage) {
            console.log(massage);
        });
    });

}

