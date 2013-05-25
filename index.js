var sax = require('sax');
var select = require('./lib/select');

module.exports = function (opts) {
    if (!opts) opts = {};
    if (!opts.special) {
        opts.special = [
            'area', 'base', 'basefont', 'br', 'col',
            'hr', 'input', 'img', 'link', 'meta'
        ];
    }
    opts.special = opts.special.map(function (x) { return x.toUpperCase() });
    
    var parser = sax.parser(false);
    var stream = select(parser, opts, write, end);
    
    function write (buf) {
        var s = buf.toString();
        buffered += s;
        parser.write(buf.toString());
    }
    
    function end () {
        if (pos < parser.position) {
            var s = buffered.slice(0, parser.position - pos);
            stream.raw(s);
        }
        stream.queue(null);
    }
    
    parser.onerror = function (err) {
        stream.emit("error", err)
    }
    
    var buffered = '';
    var pos = 0;
    var inScript = false;
    var scriptLen = 0;
    var scriptStart = 0;
    
    var update = function (type, tag) {
        var len, src;
        if (type === 'script') {
            src = tag;
            len = tag.length;
            scriptLen += len;
            inScript = true;
        }
        else if (type === 'text') {
            len = parser.textNode.length;
        }
        else if (type === 'open' && tag && tag.name === 'SCRIPT'
        && tag.attributes.src) {
            len = 0;
        }
        else if (inScript) {
            len = parser.position - scriptLen - parser.startTagPosition + 1;
            scriptLen = 0;
            inScript = false;
        }
        else if (type === 'special') {
            len = 0;
        }
        else {
            len = parser.position - parser.startTagPosition + 1;
        }
        
        if (type === 'open' && tag && tag.name === 'SCRIPT') {
            scriptLen = len;
        }
        
        pos = parser.position;
        
        src = src || buffered.slice(0, len);
        buffered = buffered.slice(len);
        
        stream.raw(src);
        return src;
    };
    
    var lastOpen;
    parser.onopentag = function (tag) {
        lastOpen = tag.name;
        
        stream.pre('open', tag);
        update('open', tag);
        stream.post('open', tag);
        if (opts.special.indexOf(tag.name) >= 0) {
            stream.pre('close', tag.name);
            update('special');
            stream.post('close', tag.name);
        }
    };
    
    parser.oncomment = function(comment) {
        src = buffered.slice(0, comment.length + 7)
        buffered = buffered.slice(comment.length + 7)
        stream.raw(src)
    }
    
    parser.onclosetag = function (name) {
        stream.pre('close', name);
        update('close');
        stream.post('close', name);
    };
    
    parser.ontext = function (text) {
        stream.pre('text', text);
        update('text');
        stream.post('text', text);
    };
    
    parser.onscript = function (src) {
        stream.pre('script', src);
        update('script', src);
        stream.post('script', src);
    };
    
    return stream;
};
