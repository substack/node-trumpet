var trumpet = require('../');
var fs = require('fs');
var test = require('tape');
var concat = require('concat-stream');

test('.selectAll() write stream opened before .getAttribute()', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    
    tr.pipe(concat(function (body) {
        t.equal(
            body.toString(),
            '<a href="foo">foo</a>\n<a href="bar"></a>\n<a href="foo">foo</a>\n'
        );
    }));
    
    tr.selectAll('a[href]', function(node) {
        var out = node.createWriteStream();
        
        node.getAttribute('href', function(href) {
            if(href !== 'foo') {
                out.end();
                
                return;
            }
            
            out.end(href);
        });
    });
    
    fs.createReadStream(__dirname + '/selectall_write_stream.html').pipe(tr);
});

test('.selectAll() write stream opened inside .getAttribute()', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    
    tr.pipe(concat(function (body) {
        t.equal(
            body.toString(),
            '<a href="foo">foo</a>\n<a href="bar"></a>\n<a href="foo">foo</a>\n'
        );
    }));
    
    tr.selectAll('a[href]', function(node) {
        node.getAttribute('href', function(href) {
            if(href !== 'foo') {
                return;
            }
            
            node.createWriteStream().end(href);
        });
    });
    
    fs.createReadStream(__dirname + '/selectall_write_stream.html').pipe(tr);
});
