var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');
var BufferedStream = require('bufferedstream');

test('update streaming', function (t) {
    t.plan(2);
    var html = fs.readFileSync(__dirname + '/update_target.html', 'utf8');

    var tr = trumpet();
    fs.createReadStream(__dirname + '/update.html').pipe(tr);
    
    var spans = [ 'tacos', 'y', 'burritos' ];
    
    tr.select('.b span', function (node) {
        node.update(function (html) {
            var stream = new BufferedStream();
            stream.end(html.toUpperCase());
            return stream;
        });
    });

    tr.select('.c', function (node) {
        node.update(function() {
            var stream = new BufferedStream();
            stream.end('---');
            return stream;
        });
    });
    
    tr.select('.d', function (node) {
        node.remove();
    });
    
    tr.select('.e', function (node) {
        node.remove();
    });
    
    tr.select('.f', function (node) {
        node.replace(function() {
            var stream = new BufferedStream();
            stream.end('<b>NOTHING TO SEE HERE</b>');
            return stream;
        });
    });
    
    tr.select('.g', function (node) {
        node.replace(function (html) {
            t.equal(html, '<div class="g">EVERYTHING IS TERRIBLE</div>');
            var stream = new BufferedStream();
            stream.end('<blink>TERRIBLE</blink>');
            return stream;
        });
    });
    
    var data = '';
    tr.on('data', function (buf) { data += buf });
    
    tr.on('end', function () {
        t.equal(data, html);
    });
});
