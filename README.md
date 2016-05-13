Twitter Smart Geospatial Stream
=========

This project uses only stream of geospatial data coming from public Twitter stream. This project is an outcome of my geospatial analysis of the available data and tries to  utilize my personal experience to prevent others from failure and time wasting with data harmonozation.

I tried to use some machine learning methods to learn current parameters of the stream and then offers to store and further analyze only relevant data. Project is divided to phases:

Phase one
- get variable sample of the stream and do some analytics

Phase two
- provide results of samples testing
- create DB and collections on provided connection

Phase three
- download and store relevant data separately
- filter garbage to special collections

A small library providing utility methods to `escape` and `unescape` HTML entities

## Installation

  npm install twitter-smart-geo-stream --save

## Usage

  var smartGeoStream = require('twitter-smart-geo-stream');



  var scapegoat = require('scapegoat')
      escape = scapegoat.escape,
      unescape = scapegoat.unescape;

  var html = '<h1>Hello World</h1>',
      escaped = escape(html),
      unescaped = unescape(escaped);

  console.log('html', html, 'escaped', escaped, 'unescaped', unescaped);

## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History - based on http://semver.org/

* 0.1.0 Initial release
* 0.1.1 in development...
