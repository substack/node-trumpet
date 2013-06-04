var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');

test('doctype tags', function(t) {
    t.plan(1);
    var tr = trumpet();
    fs.createReadStream(__dirname + '/doctype.html').pipe(tr);
    tr.select('div', function (node) {
        node.html(function (html) {
            t.equal(html, '\n  ');
        });
    });
});


