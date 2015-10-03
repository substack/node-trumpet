var trumpet = require('../');
var test = require('tape');
var fs = require('fs');
var through = require('through2');

test(function (t) {
    t.plan(1);
    
    var tr = trumpet();
    tr.selectAll('div', function(e) {
      e.createWriteStream().end();
    });
    
    var thr = through.obj(function (chunk, enc, next) {
      next();
    }, function () {
      t.ok(true); // make sure we got through the file.
    });
    
    fs.createReadStream(__dirname + '/large.html').pipe(tr).pipe(thr);
});
