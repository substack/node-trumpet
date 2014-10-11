var trumpet = require('../');
var fs = require('fs');
var through = require('through');
var test = require('tape');
var concat = require('concat-stream');

test('read inner and write outer', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    var div = tr.select('div');
    var rs = div.createReadStream();
    var ws = div.createWriteStream({outer: true});
    rs.pipe(through(function (buf) {
        this.queue(buf.toString().toUpperCase());
    })).pipe(ws);
    
    tr.pipe(concat(function (body) {
        t.equal(
            body.toString(),
            '<html>\n<body>\nXYZ\n</body>\n</html>\n'
        );
    }));
    
    fs.createReadStream(__dirname + '/through_stream.html').pipe(tr);
});

test('read inner to write inner', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    var div = tr.select('div');
    var rs = div.createReadStream();
    var ws = div.createWriteStream();
    var thru = through(function (buf) {
        this.queue(buf.toString().toUpperCase());
    });
    rs.pipe(thru).pipe(ws);
    
    tr.pipe(concat(function (body) {
        t.equal(
            body.toString(),
            '<html>\n<body>\n<div>XYZ</div>\n</body>\n</html>\n'
        );
    }));
    
    fs.createReadStream(__dirname + '/through_stream.html').pipe(tr);
});

test('read outer to write inner', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    var div = tr.select('div');
    var rs = div.createReadStream({outer: true});
    var ws = div.createWriteStream();
    rs.pipe(through(function (buf) {
        this.queue(buf.toString().toUpperCase());
    })).pipe(ws);
    
    tr.pipe(concat(function (body) {
        t.equal(
            body.toString().replace(/div/gi, 'div'),
            '<html>\n<body>\n<div><div>XYZ</div></div>\n</body>\n</html>\n'
        );
    }));
    
    fs.createReadStream(__dirname + '/through_stream.html').pipe(tr);
});
