var trumpet = require('../');
var test = require('tape');
var concat = require('concat-stream');

test(function (t) {
    t.plan(1);
    
    var tr = trumpet();
    
    var body = tr.createStream('.row');
    body.pipe(body, { end : false });
    body.on('end', function () {
        body.end('<b>wow</b>');
    });

    tr.select('.row i').setAttribute('name', 'foo');

    tr.pipe(concat(function (body) {
        t.equal(
            body.toString(),
            '<div class="row"><i name="foo">so</i> <b>wow</b></div>'
        );
    }));

    tr.end('<div class="row"><i>so</i> </div>');
});
