var sax = require('sax');
var select = require('./lib/select');
var BufferedStream = require('bufferedstream');
var Middle = require('middle');

module.exports = function (opts) {
    if (!opts) opts = {};
    if (!opts.special) {
        opts.special = [
            'area', 'base', 'basefont', 'br', 'col',
            'hr', 'input', 'img', 'link', 'meta'
        ];
    }
    opts.special = opts.special.map(function (x) { return x.toUpperCase() });
    if (! opts.bufferSize) { opts.bufferSize = 1024; }
    
    var parser = sax.parser(false);
    var stream = select(parser, opts);

    var bufferedStream = new BufferedStream(opts.bufferSize);
    var middle = new Middle(bufferedStream, stream);

    middle.select = function() {
        return stream.select.apply(stream, arguments);
    };
    middle.update = function() {
        return stream.update.apply(stream, arguments);
    };
    middle.remove = function() {
        return stream.remove.apply(stream, arguments);
    };
    middle.replace = function() {
        return stream.replace.apply(stream, arguments);
    };

    parser.onerror = function (err) {
        stream.emit("error", err)
    }
    
    function write (buf) {
        stream.emit('data', buf);
    }
    
    var buffered = '';
    var pos = 0;
    var update = function (type, tag, done) {
        if (typeof tag === 'function') {
            done = tag;
            tag = undefined;
        }

        if (type === 'script') {
            var len = tag.length;
        }
        else if (type === 'text') {
            var len = parser.startTagPosition - pos - 1;
        }
        else if (type === 'open' && tag && tag.name === 'SCRIPT'
        && tag.attributes.src) {
            var len = 0;
        }
        else {
            var len = parser.position - parser.startTagPosition + 1;
        }
        pos = parser.position;
        
        var src = buffered.slice(0, len);
        buffered = buffered.slice(len);
        
        stream.raw(src, done);
        return src;
    };
    
    stream.write = function (buf) {
        var s = buf.toString();
        buffered += s;
        parser.write(buf.toString());
    };
    
    stream.end = function (buf, next) {
        if (buf !== undefined) stream.write(buf);
        
        if (pos < parser.position) {
            var s = buffered.slice(0, parser.position - pos);
            stream.raw(s);
        }
        parser.close();
        
    };
    
    parser.onopentag = function (tag) {
        stream.pre('open', tag);
        update('open', tag, function() {
            stream.post('open', tag);
        });
    };

    parser.onend = function() {
        stream.emit('end');
    };

    //
    // Pausing and resuming
    //

    var paused = false;

    oldResume = parser.resume;
    parser.resume = function() {
        paused = false;
        oldResume.call(parser);
        bufferedStream.resume();
    };

    oldPause = parser.pause;
    parser.pause = function() {
        bufferedStream.pause();
        paused = true;
        oldPause.call(parser);
    };
    
    parser.onclosetag = function (name) {
        parser.pause();
        stream.pre('close', name, function() {
            update('close', function() {
                stream.post('close', name);
                parser.resume();
            });
        });
    };
    
    parser.ontext = function (text) {
        stream.pre('text', text);
        update('text', function() {
            stream.post('text', text);
        });
    };
    
    parser.onscript = function (src) {
        stream.pre('script', src);
        update('script', src, function() {
            stream.post('script', src);
        });
    };
    
    return middle;
};
