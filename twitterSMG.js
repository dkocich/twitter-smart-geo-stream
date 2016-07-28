'use strict';

/**
 * Module dependencies
 */
require('mongodb');
var s = require('sentiment');
//require('cld');

var async = require("async"),
    DatabaseCleaner = require('database-cleaner'),
    MongoClient = require('mongodb').MongoClient,
    format = require('util').format;
var Twit = require('twit');
var franc = require('franc');
var sentiment = require('sentiment');

// Package version
const VERSION = require('./package.json').version;
console.log(VERSION);

const text = require('./data/texts.js').messages;


/**
 * @param parameters.locations LONLAT bounding box (see Twitter documentation - example is ['-180.00', '-90.0', '180.00', '90.0'])
 * @param parameters.sampleSize Number of tweets (default 100)
 * @param parameters.calcStats do sampling(default false)
 * @param parameters.useMongoDB (default true)
 * @param parameters.hostMongo host address (default localhost)
 * @param parameters.portMongo port to db (default 27017)
 * @param parameters.dbMongo database
 * @param parameters.calcSentiment calc sentiment values
 * @param parameters.filterSpan false
 * @param parameters.filterByLocation false
 * @param parameters.consumer_key 'yourConsumerKey'
 * @param parameters.consumer_secret 'yourConsumerSecret'
 * @param parameters.access_token 'yourAccessToken'
 * @param parameters.access_token_secret 'yourAccessTokenSecret'
 * @param parameters.timeout_ms 60 * 1000
 * @param parameters.verbose default 'debug'
 */
var twitterSMGstart = function (parameters) {
    var p = parameters;
    var connString, pgConnString;

    var rNumTotal, rNumIn, rNumOut;


    /**
     * ASYNC SERIES OF PROCESSES
     */
    async.series([

        /**
         *
         * FIRST ASYNC STEP
         *
         */
        this.start = function (callback) {
            console.log('... DEBUGLOG start() === spusteno');
            /*async.series([
             function(){ ... },
             function(){ ... }
             ]);*/
            //this.testLog();
            //this.cleanAndInitDb();

            //this.sample();
            //this.calcStats();

            callback();
        },

        /**
         *
         *  SECOND ASYNC STEP
         *
         */
        this.testLog = function (callback) {

            // log all parameters
            if (p.verbose === 'debug') {
                console.log('... DEBUGLOG ===== STARTING WITH THESE PARAMS ===== ' + '\n',
                    'locations:             ', p.locations + '\n',
                    'sampleSize:            ', p.sampleSize + '\n',
                    'calcStats:             ', p.calcStats + '\n',
                    'useMongoDB:            ', p.useMongoDB + '\n',
                    'hostMongo:             ', p.hostMongo + '\n',
                    'portMongo:             ', p.portMongo + '\n',
                    'dbMongo:               ', p.dbMongo + '\n',
                    'calcSentiment:         ', p.calcSentiment + '\n',
                    'filterSpam:            ', p.filterSpam + '\n',
                    'filterByLocation:      ', p.filterByLocation + '\n',
                    'consumer_key:          ', p.consumer_key + '\n',
                    'consumer_secret:       ', p.consumer_secret + '\n',
                    'access_token:          ', p.access_token + '\n',
                    'access_token_secret:   ', p.access_token_secret + '\n',
                    'timeout_ms:            ', p.timeout_ms + '\n',
                    'verbose:               ', p.verbose + '\n',
                    ' ===== END LOG ====='
                );
            }

            // detect missing access keys and finish
            if (p.consumer_key == undefined ||
                p.consumer_secret == undefined ||
                p.access_token == undefined ||
                p.access_token_secret == undefined) {
                throw new error('MISSING ACCESS KEYS');
            }

            // set default values for non-set parameters
            if (p.track == undefined) p.track = undefined;
            if (p.locations == undefined) p.locations = ['-180.0 , -90.0 , 180.0 , 90.0'];
            if (p.sampleSize == undefined) p.sampleSize = 100;
            if (p.calcStats == undefined) p.calcStats = false;
            if (p.useMongoDB == undefined) p.useMongoDB = false;
            if (p.hostMongo == undefined) p.hostMongo = 'localhost';
            if (p.portMongo == undefined) p.portMongo = '27017';
            if (p.dbMongo == undefined) p.dbMongo = 'twittersmg';
            if (p.checkLanguage == undefined) p.checkLanguage = false;
            if (p.calcSentiment == undefined) p.calcSentiment = false;
            if (p.checkSource == undefined) p.checkSource = false;
            if (p.sourceType == undefined) p.sourceType = false;
            if (p.filterSpam == undefined) p.filterSpam = false;
            if (p.filterByLocation == undefined) p.filterByLocation = false;
            if (p.timeout_ms == undefined) p.timeout_ms = 60 * 1000;
            if (p.verbose == undefined) p.verbose = 'debug';

            // init connection string to MongoDB
            connString = 'mongodb://' + p.hostMongo + ':' + p.portMongo + '/' + p.dbMongo;
            console.log(connString);

            // TODO init connection string to PostgreSQL
            // pgConnString = 'postgresql://' + p.hostPg  + ':' + p.portPg + '/' + p.dbPg ;

            callback();
        },

        /**
         *
         * THIRD ASYNC STEP
         * clean old databases from MongoDB
         */
        this.cleanDb = function (callback) {

            // clean only on debug to prevent from loosing data
            if (p.verbose == 'debug') {

                var databaseCleaner = new DatabaseCleaner('mongodb');
                var connect = require('mongodb').connect;

                // var connString = 'mongodb://localhost/' + p.dbMongo;
                // console.log('...cleanDb() ===      ', connString);

                connect(connString, function (err, db, p) {

                    // delete all collections in DB
                    databaseCleaner.clean(db, function () {
                        console.log('...cleanDb() ===       cleaning done');
                        db.close();
                        callback(); // clear and end in debug
                    });

                });

                // end directly in production
            } else {
                callback();
            }
        },

        /**
         *
         * FOURTH ASYNC STEP
         *
         */
        this.initDb = function (callback) {

            // only when we want to use MongoDB
            if (p.useMongoDB) {

                //connect to db
                MongoClient.connect(connString, function (err, db) {

                    // end on error connecting?
                    if (err) throw err;

                    console.log('...initDb() ===        connected to ', p.dbMongo);

                    // create collections with timestamp
                    db.createCollection('unknown', function (err, collection) {
                        if (err) throw err;
                    });
                    db.createCollection('spambots', function (err, collection) {
                        if (err) throw err;
                    });
                    db.createCollection('sample', function (err, collection) {
                        if (err) throw err;
                    });
                    var date = new Date();
                    console.log(date);

                    db.createCollection('data' + date.getFullYear() + ('0' + (date.getMonth() + 1 )).slice(-2) + date.getUTCDate(), function (err, collection) {
                        if (err) throw err;
                    });
                    console.log('... initDb() ===        created collections - errors, spambots, sample' + p.sampleSize);

                    callback();
                });

                // end directly when we dont use MongoDB
            } else {
                callback();
            }

            // // TODO only when we want to use PostgreSQL
            // if (p.usePostgresql) {
            //     //connect to db
            //         callback();
            //
            //     // end directly when we dont use MongoDB
            // } else {
            //     callback();
            // }

        },

        /**
         *
         *  FIFTH ASYNC STEP
         *
         */
        this.sampleOrStream = function (callback) {
            console.log('... sample() ===        sampling/streaming begins');

            //TODO PRIPOJ TWITTER
            // init Twitter connection keys
            var T = new Twit({
                consumer_key: p.consumer_key,
                consumer_secret: p.consumer_secret,
                access_token: p.access_token,
                access_token_secret: p.access_token_secret,
                timeout_ms: p.timeout_ms  // optional HTTP request timeout to apply to all requests.
            });

            // {
            //     "config": {
            //     "consumer_key": "aaa",
            //         "consumer_secret": "bbb",
            //         "access_token": "ccc",
            //         "access_token_secret": "ddd",
            //         "timeout_ms": 60000
            // },
            //     "_twitter_time_minus_local_time_ms": 0
            // }

            // console.log(p.consumer_key, p.consumer_secret, p.access_token, p.access_token_secret);
            // console.log(T.consumer_key, T.consumer_secret, T.access_token, T.access_token_secret);
            // console.log(T.config.consumer_key, T.config.consumer_secret, T.config.access_token, T.config.access_token_secret);

            /**
             * calculates all kinds of other parameters
             * @param tweet Object One incoming tweet
             */
            var processTweet = function (tweet) {

                var dateNow = new Date().toISOString();
                console.log(dateNow, tweet.lang, tweet.user.lang, tweet.text);

                // return console.log(tweet);
                console.log(p.checkSource);

                // if (p.checkSource) {
                //     switch (p.sourceType) {
                //         case 'human':
                //
                //             if (tweet.source == '<a href="http://twitter.com/download/iphone" rel="nofollow">Twitter for iPhone</a>') {
                //                 console.log(tweet.source);
                //                 console.log(p.sourceType);
                //                 return;
                //             }
                //             // || '<a href="http://instagram.com" rel="nofollow">Instagram</a>'
                //             // || '<a href="http://twitter.com" rel="nofollow">Twitter Web Client</a>':
                //             break;
                //
                //         case 'meteo':
                //
                //             break;
                //
                //         default:
                //
                //     }
                // }

                /**
                 * detect language
                 */
                if (p.checkLanguage == true) {
                    if (p.verbose === 'debug') console.log('checkLanguage is set to ... ', p.checkLanguage);

                    var francRes = franc(tweet.text);
                    // console.log(francRes); // 'eng', 'nld', 'und' ...
                    tweet.francR = francRes;
                }

                /**
                 * calculate text sentiment value
                 */
                if (p.calcSentiment == true) {
                    if (p.verbose === 'debug') console.log('calcSentiment is set to ... ', p.calcSentiment);

                    // if (tweet.lang === 'en' /*&& francRes === 'eng'*/) {
                    //     var sentResEn = sentiment(tweet.text);
                    //     tweet.sentR = sentResEn;
                    //     // en en FUCK I ACCIDNETSLLY SCROLLED ALL THE WAY UP I HATE SAFARI
                    //
                    //     // console.log(sentResEn);
                    //
                    //     // { score: -7,
                    //     //     comparative: -0.6363636363636364,
                    //     //     tokens:
                    //     //     [ 'fuck',
                    //     //         'i',
                    //     //         'accidnetslly',
                    //     //         'scrolled',
                    //     //         'all',
                    //     //         'the',
                    //     //         'way',
                    //     //         'up',
                    //     //         'i',
                    //     //         'hate',
                    //     //         'safari' ],
                    //     //         words: [ 'hate', 'fuck' ],
                    //     //     positive: [],
                    //     //     negative: [ 'hate', 'fuck' ] }
                    // }

                    // TODO DOPLNIT NEMECKY SENTIMENT CALCULATOR
                    // if (tweet.lang === 'de' && francRes === 'deu') {
                    //     // var sentResDe =
                    //     // tweet.sentR = sentResDe;
                    // }

                }

                /**
                 * TODO calculate local time from coordinates
                 */
                // if (p.calcLocalT == true) {
                //
                //     // only if there are no coordinates and only "tweet.place" geolocolation type
                //     if (tweet.coordinates == undefined) {
                //
                //         var countryCode = place.country_code; // US, EN, DE, etc.
                //         // TODO najdi v kod statu v geojsonu se
                //
                //         // spocitej ze souradnic casovou zonu
                //     } else {
                //
                //         // var lon = tweet.coordinate.coordinate.1 ;
                //         // var lat = tweet.coordinate.coordinate.0 ;
                //     }
                //
                //     tweet.localT = resLocalT;
                // }

                // TODO ZISKEJ CASOVOU ZONU Z POLOHY UZIVATELE
                // a ) turf a prunik s polygonem s atributy casove zony
                // b ) nejaky modul pro prevod souradnice na TZ

                // if (tweet.coordinates) {
                //     console.log(tweet.coordinates);
                // } else if (tweet.place) {
                //     console.log(tweet.place.full_name, tweet.place.country_code);
                // }

                // if (p.calcTz = true) {
                //
                // };

                return tweet;
            };

            // TODO
            var openDb = function (accessLevel) {

                // TODO otevrit databazi

                if (accessLevel === 'sample') {

                    MongoClient.connect(connString, function (err, db) {
                        if (err) throw err;

                        db.collection('sample', function (error, collection) {
                            var sampleCollection = collection;
                        })

                    });
                } else if (accessLevel === 'stream') {

                    MongoClient.connect(connString, function (err, db) {
                        if (err) throw err;

                        db.collection('production', function (error, collection) {
                            var sampleCollection = collection;
                        })

                    });
                }

            };
            //
            // var saveToDb = function (tweet) {
            //
            // };

            //TODO UDELEJ VZOREK

            if (p.verbose == 'debug') {

                console.log('THIS IS DEBUG MODE');
                var sampleSizeCounter = 0;
                //
                // stream a sample of public statuses
                //

                // TODO
                openDb('sample');

                var stream = T.stream('statuses/sample');

                stream.on('tweet', function (tweet) {
                    var date = new Date().toISOString();
                    console.log(date, tweet.lang, tweet.user.lang, tweet.text);
                    sampleSizeCounter++;

                    if (sampleSizeCounter = p.sampleSize) {
                        stream.stop();
                        callback();
                    }

                    processTweet(tweet);

                    // saveToDb(tweet);

                    //TODO ULOZ VZOREK DO DB
                });

            } else if (p.verbose == 'production') {

                // TODO
                openDb('THIS IS PRODUCTION MODE');

                var stream = T.stream('statuses/filter', {
                    // track: p.track,
                    locations: p.locations
                });

                /**
                 * VARIOUS STREAM EVENTS DESCRIBED AT TWIT MODULE
                 * */
                stream.on('error', function (error) {
                    var date = new Date().toISOString();
                    console.log(date + '.....LOG EVENT ERROR');
                    throw error;
                });
                stream.on('limit', function (limitMessage) {
                    var date = new Date().toISOString();
                    //console.log(date + ' .....LOG EVENT LIMIT ' + limitMessage);
                    return console.log(date + ' .....LOG EVENT LIMIT ' + JSON.stringify(limitMessage));
                });
                stream.on('warning', function (warning) {
                    var date = new Date().toISOString();
                    return console.log(date + ' .....LOG EVENT WARNING warning is ' + warning);
                });
                stream.on('disconnect', function (disconnectMessage) {
                    var date = new Date().toISOString();
                    //console.log();
                    return console.log(date + ' .....LOG EVENT DISCONNECT disconnectMessage is ' + disconnectMessage);
                });
                stream.on('reconnect', function (request, response, connectInterval) {
                    var date = new Date().toISOString();
                    console.log(date + ' .....LOG EVENT RECONNECT connectInterval is ' + connectInterval);
                    throw new Error("Something went badly wrong - ending script. Forever - restart!!!");
                    //console.log(request);
                    //console.log(response);
                    //console.log(connectInterval);
                });
                stream.on('status_withheld', function (withheldMsg) {
                    var date = new Date().toISOString();
                    return console.log(date + ' .....LOG EVENT STATUSWITHHELD statusWitheld is ' + withheldMsg);
                });
                stream.on('user_withheld', function (withheldMsg) {
                    var date = new Date().toISOString();
                    return console.log(date + ' .....LOG EVENT USERWITHHELD userWitheld is ' + withheldMsg);
                });
                stream.on('connected', function (response) {
                    var date = new Date().toISOString();
                    return console.log(date + ' .....LOG EVENT CONNECTED response is ' + response);
                });

                /**
                 * MAIN PART AND LOGIC IS HERE
                 */
                stream.on('tweet', function (tweet) {
                    // rNumTotal++;

                    sampleSizeCounter++;

                    // stop if there is enoguht tweets
                    if (sampleSizeCounter == p.sampleSize) {
                        stream.stop();
                        callback();
                    }

                    /**
                     * tweet - input
                     * tweet - output
                     */
                    processTweet(tweet);
                    
                    // save tweet
                    // saveToDb(tweet);

                });
            }
        },

        /**
         * 
         * SIXTH ASYNC STEP
         *  DO STATISTICS
         */
        this.calcStats = function (callback) {
            console.log('... calcStats() ===     pocitam statistiky');


            console.log('... total / rNumIn / rNumOut', rNumTotal, rNumIn, rNumOut)


            callback();

            //TODO NAJDI AUTORY S VIC NEZ 1 TWEETEM A ZJISTI ODCHYLKY V POLOZE -

            //TODO

            //TODO NAJDI SPAMY POMOCI DETEKCE JAZYKA - MENSI NEZ X PRISLUSNOST

            //TODO FUZZY HLEDANI SPAMERU PODLE PROFILU - CIM VIC TWEETU, DATUM ZALOZENI

        }
    ]);
};

// var flog = function (a) {
//     return console.log(a);
// };

module.exports = {
    twitterSMGstart: twitterSMGstart
};


//var twitterSMG = require('twitter-smart-geo-stream');
//var sanFrancisco = [ '-122.75', '36.8', '-121.75', '37.8' ];


/*var smgDruhy = new twitterSMG({
 locations: ['-10.0', '20.0', '10.0', '40.0'],
 sampleSize: 250,
 calcStats: true,
 useMongoDB: true,
 hostMongo: 'localhost',
 portMongo: '27017',
 dbMongo: 'mojeDatabaze',
 calcSentiment: false,
 filterSpam: false,
 filterByLocation: false,
 consumer_key: 'h5EUsV1oaCF3Zqi7vwK3Il07v',
 consumer_secret: 'KEvWeD9ZWk1LO8pjtBMblYCfvF1E4keZ4y6Uap15MsJe50hYAQ',
 access_token: '2832363724-FLoz3awEnhL9xFa1gApfbgFxaVjCc2FheIrlReG',
 access_token_secret: 'iqmAyOKWYTu6J5LwDnp2oLpruxaVENwm1TddFUDG9Reh1',
 timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
 verbose: 'debug'
 });*/

// spawn first instance to San Francisco
//smgPrvni.start();

// spawn second instance to Germany
//smgDruhy.start();


/**
 * Adds commas to a number
 * @param {number} number
 * @param {string} locale
 * @return {string}
 */
// module.exports = function(number, locale) {
//     return number.toLocaleString(locale);
// };

/**
 * Escape
 */
//
// module.exports = {
//   initiate: function ( params ) {
//     return ; //Object(params)
//   },
//   connect: function ( host, db, collection) {
//     return ; //Object(connection)
//   },
//   createDb: function() {
//     var finished = true;
//     return ; // Boolean(finished)
//   },
//   sample: function( connParams, amount ) {
//     return ; // Object(sampleTweets)
//   },
//   analyze: function( connParams, amount ) {
//     return ; // Object(histograms)
//   }
// };

// escape: function(html) {
//   return String(html)
//     .replace(/&/g, '&amp;')
//     .replace(/"/g, '&quot;')
//     .replace(/'/g, '&#39;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;');
// },
//
// /**
//  * Unescape special characters in the given string of html.
//  *
//  * @param  {String} html
//  * @return {String}
//  */
// unescape: function(html) {
//   return String(html)
//     .replace(/&amp;/g, '&')
//     .replace(/&quot;/g, '"')
//     .replace(/&#39;/g, ''')
//     .replace(/&lt;/g, '<')
//     .replace(/&gt;/g, '>');
// }