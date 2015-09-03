var trumpet = require('../');
var tr = trumpet();

//pipe results to stdout
tr.pipe(process.stdout);

//replace tbody element text
var ws = tr.select('tbody').createWriteStream();
ws.end('<tr><td>rawr</td></tr>');

//pipe html from file to trumpet for this example
var fs = require('fs');
fs.createReadStream(__dirname + '/html/table.html').pipe(tr);
