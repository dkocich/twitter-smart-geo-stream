Twitter Smart Geospatial Stream
=========

[![Greenkeeper badge](https://badges.greenkeeper.io/dkocich/twitter-smart-geo-stream.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/SummerWish/twitter-smart-geo-stream.svg?branch=master)](https://travis-ci.org/dkocich/twitter-smart-geo-stream)
[![npm version](https://img.shields.io/npm/v/twitter-smart-geo-stream.svg)](https://www.npmjs.com/package/twitter-smart-geo-stream) [![npm download counter](https://img.shields.io/npm/dm/twitter-smart-geo-stream.svg)](https://www.npmjs.com/package/twitter-smart-geo-stream)

[![Dependency Status](https://david-dm.org/dkocich/twitter-smart-geo-stream.svg)](https://david-dm.org/dkocich/twitter-smart-geo-stream) [![devDependency Status](https://david-dm.org/dkocich/twitter-smart-geo-stream/dev-status.svg)](https://david-dm.org/dkocich/twitter-smart-geo-stream#info=devDependencies)

[![NodeICO](https://nodei.co/npm/twitter-smart-geo-stream.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/twitter-smart-geo-stream)

[![Known Vulnerabilities](https://snyk.io/test/npm/twitter-smart-geo-stream/badge.svg)](https://snyk.io/test/npm/twitter-smart-geo-stream)
[![Known Vulnerabilities](https://snyk.io/test/github/dkocich/twitter-smart-geo-stream/badge.svg)](https://snyk.io/test/github/dkocich/twitter-smart-geo-stream)

This project uses only stream of geospatial data coming from public Twitter stream.

It is an outcome of my geospatial analysis of the available data and tries to utilize my personal experience to prevent others from time wasting processes with data harmonozation.

I tried to use machine learning methods to learn current parameters of the stream and then offers to store and further analyze only relevant data.

See input parameters which vary depending on required analysis.

Project offers to:
- collect variable samples of the stream and do some analytics
- provide results of test on sammples
- create DB and collections on provided connection and store data
- download and store only relevant data separately (filter or throw away data that you don't need)

## Requirements
Install (optional):
- PostgreSQL     https://www.pipelinedb.com/download
- MongoDB        https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
- Redis          http://redis.io/download

## Usage

For usage see examples/exampleFile.js ... Basically you have set something like this:

```javascript
var parameters = {
    /*  GENERAL
     *  keywords - for details see https://dev.twitter.com/streaming/overview/request-parameters#track
     *  some place or world = [ '-180.0','-90.0','180.0','90.0'];
     */
    track:              'apple',
    locations:          ['-125','20','-101','50'],
    verbose:            'production',   // 'production' 'debug'

    sampleSize:         5,              // any number OR 0 as infinity
    calcStats:          true,           // true - false
    verbose:            'production',   //'production' - 'debug'

    /* Twitter access and Twit module settings
     * GRAB YOUR KEYS AT https://apps.twitter.com/
     */
    consumer_key:       'aaa',
    consumer_secret:    'bbb',
    access_token:       'ccc',
    access_token_secret:'ddd',
    // optional HTTP request timeout to apply to all requests.
    timeout_ms:         10 * 1000,

    /*
     * STORAGE CONNECTION
     */
    createNewDb:        false,          // change or use detault
    indexMongo:         false,
    indexPg:            false,
    // MongoDB
    useMongoDB:         false,          // change or use detault
    hostMongo:          'localhost',    // change or use detault
    portMongo:          '27017',        // change or use detault
    dbMongo:            'twittersgs',   // change or use detault
    // PostgreSQL
    usePg:              false,          // change or use detault
    hostPg:             'localhost',    // change or use detault
    portPg:             '5432',         // change or use detault
    dbPg:               'twittersgs',   // change or use detault
    // Redis
    useR:               false,
    hostR:              '192.168.99.100',// default for Docker container, otherwise 127.0.0.1:6379
    portR:              '32768',
    dbR:                'twittersgs',

    /*
     *  FILTER
     */
    inclRetweets:        true,          // true - false

    checkContent:       false,          // true - false
    contentWord:        false,          // true - false

    checkSource:        true,           // true - false
    sourceType:         'human',
    // category of source classification
    // for details see './data/tweetSource.csv' - 'all' 'human' 'web device'
    // 'mobile devices' 'meteo' 'earthquakes' 'trends' 'traffic'

    checkSpam:          false,          // true - false
    checkByLocation:    false,          // true - false

    /*
     *  IMPROVE and REPAIR
     */
    calcPlaceCenter:    true,           // true - false
    calcPlaceCenterL:   'all',          // 'all' 'country' 'city' 'neighbourhood' 'poi'

    castDateString:     true,           // true - false
    calcLocalTime:      true,           // true - false

    checkLanguage:      true,           // true - false
    calcSentiment:      true,           // true - false

    /*
     *  OPTIMIZE
     */
    geoparse:           false           // true - false
    tweetSaveSize:      'full',         // full - medium - small
    delUserMd:          false,          // true - false
    delPlaceMd:         false,          // true - false

    /*
     * CREATE DERIVED DATASETS
     */
    buildUserNetwork:   false,          // true - false
    buildTopicNetwork:  false,          // true - false
    buildUsersDb:       false,          // true - false
    buildPlaceDb:       false           // true - false
};

TSGS.twitterSGSstart(parameters);       // START WITH THIS COMMAND !!!
```

## TODO - Tests

It is required to write tests. Please look to './test/twitterSGS.test.js'. Start test with:

    npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

For further classification and commit of source devices see './data/tweetsources.csv' (with LibreOfficeCalc) and create also './data/tweetsources.js' to use it in the project.

## Release History

based on http://semver.org/

* 0.1.2
* 0.1.1 still unstable
* 0.1.0 Initial release
