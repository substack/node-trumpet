var trumpet = require('../');
var fs = require('fs');
var through = require('through');
var test = require('tape');
var concat = require('concat-stream');

test('opts.writehtml can disable html output', function (t) {
    t.plan(1);

    var tr = trumpet({writehtml: false});
    var ws = tr.select('b').createStream().pipe(through(function (data) {
        tr.queue("hello cruel world");
    }))

    tr.pipe(concat(function (body) {
        t.equal(
            body,
            "hello cruel world"
        );
    }));

    fs.createReadStream(__dirname + '/write_stream.html').pipe(tr);
});
