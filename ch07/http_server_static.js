/**
 * Created by scottmoon on 6/30/15.
 */
var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html/";

http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true, false);

})

