var trumpet = require('../');
var through = require('through');

var tr = trumpet();

//select all element and apply transformation function to selections
tr.selectAll('.x span', function (element) {
    //define function to transform input
    var upper = through(function (buf) {
        this.queue(buf.toString().toUpperCase());
    });

    //create a read/write stream for selected selement
    var estream = element.createStream();

    //stream the element's inner html to transformation function
    //then stream the transformed output back into the element stream
    estream.pipe(upper).pipe(estream);
});

//stream in html to trumpet and stream processed output to stdout
var fs = require('fs');
fs.createReadStream(__dirname + '/html/uppercase.html').pipe(tr).pipe(process.stdout);
