# trumpet

parse and transform streaming html using css selectors

[![build status](https://secure.travis-ci.org/substack/node-trumpet.png)](http://travis-ci.org/substack/node-trumpet)

![trumpet](http://substack.net/images/trumpet.png)

# examples

## replace inner

input html:

``` html
<table>
  <tbody>blah blah blah</tbody>
  <tr><td>there</td></tr>
  <tr><td>it</td></tr>
  <tr><td>is</td></tr>
</table>
```

code:

``` js
var trumpet = require('trumpet');
var tr = trumpet();
tr.pipe(process.stdout);
 
var ws = tr.select('tbody').createWriteStream();
ws.end('<tr><td>rawr</td></tr>');

var fs = require('fs');
fs.createReadStream(__dirname + '/html/table.html').pipe(tr);
```

output:

``` html
<table>
  <tbody><tr><td>rawr</td></tr></tbody>
  <tr><td>there</td></tr>
  <tr><td>it</td></tr>
  <tr><td>is</td></tr>
</table>
```

## read all

Input html:

``` html
<html>
  <head>
    <title>beep</title>
  </head>
  <body>
    <div class="a">¡¡¡</div>
    <div class="b">
      <span>tacos</span>
      <span> y </span>
      <span>burritos</span>
    </div>
    <div class="a">!!!</div>
  </body>
</html>
```

code:

``` js
var trumpet = require('trumpet');
var tr = trumpet();

tr.selectAll('.b span', function (span) {
    span.createReadStream().pipe(process.stdout);
});

var fs = require('fs');
fs.createReadStream(__dirname + '/html/read_all.html').pipe(tr);
```

output:

``` html
tacos y burritos
```

## read modify write

input html:

``` html
<html>
  <body>
    <div class="x">
      <span>hack</span>
      <span> the </span>
      <span>planet</span>
    </div>
  </body>
</html>
```

code:

``` js
var trumpet = require('trumpet');
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
```

output:

``` html
<html>
  <body>
    <div class="x">
      <span>HACK</span>
      <span> THE </span>
      <span>PLANET</span>
    </div>
  </body>
</html>
```

# methods

``` js
var trumpet = require('trumpet')
```

## var tr = trumpet(opts)

Create a new trumpet stream. This stream is readable and writable.
Pipe an html stream into `tr` and get back a transformed html stream.

Parse errors are emitted by `tr` in an `'error'` event.

## var elem = tr.select(selector)

Return a result object `elem` for the first element matching `selector`.

## tr.selectAll(selector, function (elem) {})

Get a result object `elem` for every element matching `selector`.

## elem.getAttribute(name, cb)

When the selector for `elem` matches, query the case-insensitive attribute
called `name` with `cb(value)`.

Returns `elem`.

## elem.getAttributes(name, cb)

Get all the elements in `cb(attributes)` as an object `attributes` with
lower-case keys.

Returns `elem`.

## elem.setAttribute(name, value)

When the selector for `elem` matches, replace the case-insensitive attribute
called `name` with `value`.

If the attribute doesn't exist, it will be created in the output stream.

Returns `elem`.

## elem.removeAttribute(name)

When the selector for `elem` matches, remove the attribute called `name` if it
exists.

Returns `elem`.

## elem.createReadStream(opts)

Create a new readable stream with the inner html content under `elem`.

To use the outer html content instead of the inner, set `opts.outer` to `true`.

## elem.createWriteStream(opts)

Create a new write stream to replace the inner html content under `elem`.

To use the outer html content instead of the inner, set `opts.outer` to `true`.

## elem.createStream(opts)

Create a new readable writable stream that outputs the content under `elem` and
replaces the content with the data written to it.

To use the outer html content instead of the inner, set `opts.outer` to `true`.

## tr.createStream(sel, opts)

Short-hand for `tr.select(sel).createStream(opts)`.

## tr.createReadStream(sel, opts)

Short-hand for `tr.select(sel).createReadStream(opts)`.

## tr.createWriteStream(sel, opts)

Short-hand for `tr.select(sel).createWriteStream(opts)`.

# attributes

## elem.name

The element name as a lower-case string. For example: `'div'`.

# selector syntax

Presently these [css selectors](http://www.w3.org/TR/CSS2/selector.html) work:

* *
* E
* E F
* E > F
* E + F
* E.class
* E#id
* E[attr=value]
* E[attr~=search]
* E[attr|=prefix]
* E[attr^=prefix]
* E[attr$=suffix]
* E[attr*=search]

# install

With [npm](http://npmjs.org) do:

```
npm install trumpet
```

# license

MIT
