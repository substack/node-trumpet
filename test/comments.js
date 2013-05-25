var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');

test('select', function (t) {
    t.plan(3)

    var tr = trumpet();
    fs.createReadStream(__dirname + '/comments.html').pipe(tr);

    tr.select('title', function(node) {
      node.html(function(html) {
        t.equal(html, 'beep');
      })
    })

    tr.select('.beep', function(node) {
        node.html(function(html) {
            t.equal(html, 'boop');
        });
    });

    tr.select('.bar', function(node) {
        node.html(function(html) {
            t.equal(html, 'baz');
        })
    })
});
