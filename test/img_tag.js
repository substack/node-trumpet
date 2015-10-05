var trumpet = require('../');
var fs = require('fs');
var test = require('tape');
var concat = require('concat-stream');

var html = '<html><body><img src="#"/></body></html>';
var expected = '<html><body><img src="xyz"/></body></html>';

test('self closing img tag', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    var elem = tr.select('img');
    elem.setAttribute('src', 'xyz');
    
    tr.pipe(concat(function (src) {
        t.equal(String(src), expected);
    }));
    tr.end(html);
});
