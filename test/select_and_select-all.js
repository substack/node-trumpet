var trumpet = require('..');
var test = require('tape');

test('select and select all', function (t) {
    var tr = trumpet()

    tr.select('*');
    tr.selectAll('.size');

    tr.on('data', function () {});
    tr.on('end', function () { t.end() });

    tr.end('<span class="size"></span>');
});
