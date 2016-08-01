Twitter Smart Geospatial Stream
=========

This project uses only stream of geospatial data coming from public Twitter stream. This project is an outcome of my geospatial analysis of the available data and tries to utilize my personal experience to prevent others from time wasting processes with data harmonozation.

I tried to use some machine learning methods to learn current parameters of the stream and then offers to store and further analyze only relevant data. Project is divided to phases:

Phase one
- get variable sample of the stream and do some analytics

Phase two
- provide results of samples testing
- create DB and collections on provided connection

Phase three
- download and store relevant data separately (throw away data that you don't need)
- filter garbage to special collections

## Installation

  npm install twitter-smart-geo-stream --save

## Usage

    var TSMG = require('twitter-smart-geo-stream');
     var sanFrancisco = [ '-122.75', '36.8', '-121.75', '37.8' ]

    var parameters = {
        track: 'mango',
        locations: sanFrancisco,
        sampleSize: 2,
        calcStats: true,
        useMongoDB: true,
        hostMongo: 'localhost',
        portMongo: '27017',
        dbMongo: 'twittersmg',
        checkLanguage: true,
        calcSentiment: true,
        filterSpam: false,
        filterByLocation: false,
        consumer_key: 'aaa',
        consumer_secret: 'bbb',
        access_token: 'ccc',
        access_token_secret: 'ddd',
        timeout_ms: 60 * 1000,
        verbose: 'debug'
    };

    TSMG.twitterSMGstart(parameters);

## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

based on http://semver.org/

* 0.1.1 in development...
* 0.1.0 Initial release
