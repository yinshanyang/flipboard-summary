# Flipboard Summarisation in Node

An initial attempt to implement [Flipboard’s approach to automatic summarization](http://engineering.flipboard.com/2014/10/summarization/) in Node.js.

## Example

```
var summary = require('summary');

var text = '…',
  sum = summary.summarize(text);

// sum = ['__array of sentences__']

```
