Twitter Smart Geospatial Stream
=========

This project uses only stream of geospatial data coming from public Twitter stream.

It is an outcome of my geospatial analysis of the available data and tries to utilize my personal experience to prevent others from time wasting processes with data harmonozation.

I tried to use machine learning methods to learn current parameters of the stream and then offers to store and further analyze only relevant data.

See input parameters which vary depending on required analysis.

Project offers to:
- collect variable samples of the stream and do some analytics
- provide results of test on sammples
- create DB and collections on provided connection and store data
- download and store only relevant data separately (filter or throw away data that you don't need)

## Installation
  npm install twitter-smart-geo-stream
  npm install twitter-smart-geo-stream --save (as dependency for your own modules)

## Dependencies

  npm install package.json (for development)

## Usage

For usage see examples/examplePackage.js ... Basically you have to do something like this:

    var parameters = {
        track: 'apple',                     // keywords - for details see https://dev.twitter.com/streaming/overview/request-parameters#track
        locations:['-125','20','-101','50'], // some place or world = [ '-180.0','-90.0','180.0','90.0'];
        consumer_key:       'aaa',          // Access and Twit module settings
        consumer_secret:    'bbb',          // GRAB YOUR KEYS AT https://apps.twitter.com/
        access_token:       'ccc',
        access_token_secret:'ddd',
        timeout_ms: 10 * 1000,              // optional HTTP request timeout to apply to all requests.

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

        sampleSize:         5,              // any number OR 0 as infinity
        calcStats:          true,           // true - false

        inclRetweet:        true,           // true-false
        castDateString:     true,           // true-false
        checkLanguage:      true,           // true - false
        calcSentiment:      true,           // true - false

        calcPlaceCenter:    true,           // true - false
        calcPlaceCenterL:   'all',          // 'all' - 'country' - 'city' - 'neighbourhood' - 'poi'
        calcLocalTime:      true,           // true false

        checkSource:        true,           // true - false
        sourceType:         'human',        // category of source classification - for details see './data/tweetSource.csv' - 'all' 'human', “web device” 'mobile devices' 'meteo' 'earthquakes' 'trends' 'traffic'
        checkSpam:          false,          // true - false
        checkByLocation:    false,          // true - false
        geoparse:           false           // true - false
        tweetSaveSize:      'full',         // full - medium - small

        verbose: 'production' //debug
    };

    TSGS.twitterSGSstart(parameters);       // START WITH THIS COMMAND !!!

## TODO - Tests

It is required to write tests. Please look to './test/twitterSGS.test.js'. Start test with:

    npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

For further classification and commit of source devices see './data/tweetsources.csv' (with LibreOfficeCalc) and create also './data/tweetsources.js' to use it in the project.

## Scientific publication

For more details please read:

TO BE ANNOUNCED


## Release History

based on http://semver.org/

* 0.1.2 first working release
* 0.1.1 major changes but still buggy
* 0.1.0 Initial release
