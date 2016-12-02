var path = require('path');
var fs = require('fs');
var trumpet = require('../');
var test = require('tap').test;
var concat = require('concat-stream');
var expected = fs
	.readFileSync(path.join(__dirname, 'inner_expected.html'))
	.toString();
var indexPage = fs
	.createReadStream(path.join(__dirname, 'inner_main.html'));
var transform = trumpet();
var elementStream = transform.select('#hello-world')
	.createWriteStream();

test('Usage of trumpet inside it\'s element write stream', function(t){
	t.plan(1);
	elementStream.on('drain', function () {
		var helloWorldPage = fs
			.createReadStream(path.join(__dirname, 'inner_block.html'));
		var innerTransform = trumpet();

		var innerElement = innerTransform
			.select('#inner-hello-world')
			.createWriteStream();

		innerElement.on('drain', function () {
			var innerHelloPage = fs
				.createReadStream(path.join(__dirname, 'inner_inner_block.html'));
			innerHelloPage.pipe(innerElement);
		});

		helloWorldPage
			.pipe(innerTransform)
			.pipe(elementStream);
	});

	indexPage
		.pipe(transform)
		.pipe(concat(function(result){
			var resultString = result.toString();
			t.deepEqual(resultString, expected);
			t.end();
		}));
});
