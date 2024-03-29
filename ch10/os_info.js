/**
 * Created by scottmoon on 7/1/15.
 */

var os = require('os');

console.log("tmdir :\t" + os.tmpDir());
console.log("endianness :\t" + os.endianness());
console.log("hostname: \t" + os.hostname());
console.log("type: \t" + os.type());
console.log("platform: \t" + os.platform());
console.log("arch: \t" + os.arch());
console.log("release: \t" + os.release());
console.log("uptime: \t" + os.uptime());
console.log("loadavg: \t" + os.loadavg());
console.log("totalmem: \t" + os.totalmem());
console.log("freemem: \t" + os.freemem());
console.log("EOL: \t" + os.EOL);
console.log("cpus: \t" + JSON.stringify(os.cpus()));
console.log("NetworkInterfaces : \t" + JSON.stringify(os.networkInterfaces()));
