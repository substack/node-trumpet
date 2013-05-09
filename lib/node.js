var ent = require('ent');
var Stream = require('stream').Stream;

module.exports = function (tag, sel, level) {
    return new Node(tag, sel, level);
};

function expire () {
    throw new Error('Parse expired. You had your chance.');
}

function Node (tag, sel, level) {
    this.name = tag.name.toLowerCase();
    this.attributes = tag.attributes;
    this.p = { level : level };
    
    this.tag = tag;
    this.sel = sel;
}

function emit(value, out, done) {
    var self = this;
    var sel = self.sel;

    if (value instanceof Stream) {
        var stream = value;
        stream.on('data', function(d) {
            out.emit('data', d);
        });
        stream.on('end', function() {
            sel.updating = false;
            done();
        });
    } else {
        out.emit('data', value);
        sel.updating = false;
        done();
    }
}

Node.prototype.html = function (cb) {
    var p = this.p, sel = this.sel;
    if (this.expired) expire();
    
    p.buffered = '';
    p.callback = function(html, final, done) {
        cb(html);
        done();
    };
    p.writes = 0;
    sel.pending.push(p);
};

Node.prototype.update = function (cb, attrs) {
    var self = this;
    var p = self.p, sel = self.sel;
    if (self.expired) expire();
    if (typeof cb === 'object') {
        attrs = cb;
        cb = String; // identify function
    }
    
    if (attrs) {
        var attrText = Object.keys(attrs).map(function (key) {
            return key + '="' + ent.encode(attrs[key]) + '"';
        }).join(' ');
        
        if (attrText.length) attrText = ' ' + attrText;
        var isSpecial = sel.special.indexOf(self.name) >= 0;
        
        p.buffered = '';
        p.callback = function (html, final, done) {
            var this_ = this;
            final(function (s, done) {
                var d = typeof cb === 'function' ? cb(html) : cb;
                var data = '<' + self.name + attrText + '>' + d;
                emit.call(self, data + s, this_, done);
            });
            sel.updating = false;
            done();
        };
        sel.updating = true;
        sel.removing = true;
        sel.pending.push(p);
        p.writes = 0;
        
        return;
    }
    
    p.buffered = '';
    p.callback = function (html, final, done) {
        emit.call(self, typeof cb === 'function' ? cb(html) : cb, this, done);
    };
    p.writes = 0;
    sel.updating = true;
    sel.pending.push(p);
};

Node.prototype.replace = function (cb) {
    var self = this, p = this.p, sel = this.sel;
    if (this.expired) expire();
    
    p.buffered = '';
    p.callback = function (html, final, done) {
        var this_ = this;
        final(function (s, done) {
            emit.call(self, typeof cb === 'function' ? cb(html + s) : cb, this_, done);
        });
        sel.updating = false;
        done();
    };
    sel.updating = true;
    sel.removing = true;
    sel.pending.push(p);
};

Node.prototype.remove = function () {
    var p = this.p, sel = this.sel;
    if (this.expired) expire();
    sel.updating = true;
    sel.removing = true;
    p.callback = function (html, final, done) {
        sel.updating = false;
        done();
    };
    sel.pending.push(p);
};
