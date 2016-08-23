var TSGS = require('../twitterSGS.js');
var parameters;

parameters = {
    /*  GENERAL
     *  keywords - for details see https://dev.twitter.com/streaming/overview/request-parameters#track
     *  some place or world = [ '-180.0','-90.0','180.0','90.0'];
     *  var SanFrancisco = ['-125.75', '20.8', '-101.75', '50.8'];
     */
    track:              'apple',
    locations:          ['-180.0', '-90.0', '180.0', '90.0'],

    sampleSize:         100,              // any number OR 0 as infinity
    calcStats:          true,           // true - false
    verbose:            'production',    //'production' 'debug'

    /* Twitter access and Twit module settings
     * GRAB YOUR KEYS AT https://apps.twitter.com/
     */
    consumer_key:       'ieEKT1apDrIcnjlt8wR4yOqFf',
    consumer_secret:    'ADIObvcQvp8x01jaMFX4iD5oCW9VB5noY9NW6jS558BMhY6n0t',
    access_token:       '120722111-AXtwB0S08MjOJbYJ19sQHxMbLqaFihARLAr0V7hg',
    access_token_secret:'atThRDUy5ARU6VgvuO8a7YsqkKWhF1T4MmuH1WYh28QYK',
    // optional HTTP request timeout to apply to all requests.
    timeout_ms:         10 * 1000,      // optional HTTP request timeout to apply to all requests.

    /*
     * STORAGE CONNECTION
     */
    // MongoDB
    useMongoDB:         true,          // change or use detault
    hostMongo:          'localhost',    // change or use detault
    portMongo:          '27017',        // change or use detault
    dbMongo:            'twittersgs',   // change or use detault
    // PostgreSQL
    usePg:              false,          // change or use detault
    hostPg:             'localhost',    // change or use detault
    portPg:             '5432',         // change or use detault
    dbPg:               'twittersgs',   // change or use detault

    /*
     *  FILTER
     */
    inclRetweets:       true,           // true - false

    checkContent:       false,          // true - false
    contentWord:        false,          // true - false

    checkByLocation:    false,           // true - false

    checkSource:        true,           // true - false
    sourceType:         'human',

    checkSpam:          false,          // true - false

    // category of source classification
    // for details see './data/tweetSource.csv' - 'all' 'human' 'web device'
    // 'mobile devices' 'meteo' 'earthquakes' 'trends' 'traffic'

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
    geoparse:           true,
    tweetSaveSize:      'full',         // 'full' 'medium' 'small'
    delUserMd:          false,          // true - false
    delPlaceMd:         false,          // true - false
    
    /*
     * CREATE DERIVED DATASETS
     */
    buildUserNetwork:   false,          // true - false
    buildTopicNetwork:  false,          // true - false
    buildUserDb:        false,          // true - false
    buildPlaceDb:       false           // true - false
};
TSGS.twitterSGGstart(parameters);