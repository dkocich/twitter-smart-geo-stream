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

  var twitterSMG = require('twitter-smart-geo-stream');

  var sanFrancisco = [ '-122.75', '36.8', '-121.75', '37.8' ]

  var smg = new twitterSMG({
    locations:            sanFrancisco,
    sample_size:          100,
    calculateStatistics:  true,
    useMongoDB:           true,
    hostMongo:            'localhost',
    portMongo:            '27017',
    calcSentiment:        true,
    filterSpam:           true,
    filterByLocation:     true,
    consumer_key:         '...',
    consumer_secret:      '...',
    access_token:         '...',
    access_token_secret:  '...',
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  });

  smg.start();

## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

based on http://semver.org/

* 0.1.1 in development...
* 0.1.0 Initial release
