'use strict';

/**
 * Module dependencies
 */
var moment = require('moment');
require('mongodb');
var s = require('sentiment');
//require('cld');

var async = require("async"),
    DatabaseCleaner = require('database-cleaner'),
    MongoClient = require('mongodb').MongoClient,
    format = require('util').format,
    Twit = require('twit');

var franc = require('franc'),
    sentiment = require('sentiment'),
    ml = require('ml-sentiment')({lang: 'de'});

// lonlat to TZ
var tz = require('tz-lookup');
var turf = require('turf-center');

var geolib = require('geolib');


// Package version
const VERSION = require('./package.json').version;
console.log(VERSION);

const text = require('./data/texts.js').messages;

const tweetSources = require('./data/tweetSources.js').tweetSources;
// ----- console.log(tweetSources.length); // 1151


const profiler = require('v8-profiler');
const fs = require('fs');
var profilerRunning = false;

// https://strongloop.com/strongblog/tips-optimizing-slow-code-in-nodejs/
// function toggleProfiling() {
//     if (profilerRunning) {
//         const profile = profiler.stopProfiling();
//         console.log('stopped profiling');
//         profile.export()
//             .pipe(fs.createWriteStream('./myapp-' + Date.now() + '.cpuprofile'))
//             .once('error', profiler.deleteAllProfiles)
//             .once('finish', profiler.deleteAllProfiles);
//         profilerRunning = false;
//         return
//     }
//     profiler.startProfiling();
//     profilerRunning = true;
//     console.log('started profiling');
// }
// process.on('SIGUSR2', toggleProfiling);

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
    var connStringMongo, connStringPg;

    var rNumTotal,
        rNumIn,
        rNumOut,
        rNumPassed,
        rNumLang,
        rNumMove,
        rNumFilteredSource = 0;

    var sampleSizeCounter = 0;
    var acceptedSources = [];

    var calcStreamStats = function (rawTweets) {

        console.log('pocitanim aktualni statistiku ', rawTweets.length);

        console.log(' Total # of tweets received ', sampleSizeCounter + '\n',
            ' Total # of tweets filtered out ', rNumFilteredSource + '\n',
            ' Total # of tweets passed ', rNumPassed + '\n',
            ' Total # of tweets wrong language ', rNumLang + '\n',
            ' Total # of tweets coordinates moving around world ', rNumMove + '\n');

        var users = {};
        for (var i = 0; i < rawTweets.length; i++) {
            users[rawTweets[i].user.id_str] = 1 + (users[rawTweets[i].user.id_str] || 0);
        }

        console.log(' Total users ', users.length);

    };

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
                console.log('... DEBUGLOG ===== STARTING WITH THESE PARAMS ===== ');
                console.log(p);
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
            if (p.timeout_ms == undefined) p.timeout_ms = 60 * 1000;
            if (p.verbose == undefined) p.verbose = 'debug';
            if (p.calcStats == undefined) p.calcStats = false;

            if (p.checkSource == undefined) p.checkSource = false;

            if (p.sourceType == undefined) p.sourceType = false;

            if (p.checkLanguage == undefined) p.checkLanguage = false;
            if (p.calcSentiment == undefined) p.calcSentiment = false;
            if (p.castDateString == undefined) p.castDateString = false;

            if (p.calcPlaceCenter == undefined) p.calcPlaceCenter = false;
            if (p.calcPlaceCenterL == undefined) p.calcPlaceCenterL = 'all';


            if (p.calcLocalTime == undefined) p.calcLocalTime = false;

            if (p.filterSpam == undefined) p.filterSpam = false;
            if (p.filterByLocation == undefined) p.filterByLocation = false;

            //db
            if (p.useMongoDB == undefined) p.useMongoDB = false;
            if (p.hostMongo == undefined) p.hostMongo = 'localhost';
            if (p.portMongo == undefined) p.portMongo = '27017';
            if (p.dbMongo == undefined) p.dbMongo = 'twittersmg';

            if (p.usePg == undefined) p.usePg = false;
            if (p.hostPg == undefined) p.hostPg = 'localhost';
            if (p.portPg == undefined) p.portPg = '5432';
            if (p.dbPg == undefined) p.dbPg = 'twittersmg';

            // init connection string to MongoDB
            connStringMongo = 'mongodb://' + p.hostMongo + ':' + p.portMongo + '/' + p.dbMongo;
            console.log(connStringMongo + '\n' + connStringPg);

            // TODO init connection string to PostgreSQL
            // pgConnString = 'postgresql://' + p.hostPg  + ':' + p.portPg + '/' + p.dbPg ;

            // set filtering of tweets source applications
            if (p.checkSource) {
                for (var i = 0; i < tweetSources.length; i++) {
                    if (tweetSources[i].c == p.sourceType) {
                        acceptedSources.push(tweetSources[i].idl);
                    }
                }
            }

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

                // var connStringMongo = 'mongodb://localhost/' + p.dbMongo;
                // console.log('...cleanDb() ===      ', connStringMongo);

                connect(connStringMongo, function (err, db, p) {

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
                MongoClient.connect(connStringMongo, function (err, db) {

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
                // http://stackoverflow.com/questions/6549223/javascript-code-to-display-twitter-created-at-as-xxxx-ago

                if (p.verbose == 'debug') {

                }

                if (p.checkSource) {
                    var found = false;
                    // console.log(acceptedSources);
                    for (s = 0; s < acceptedSources.length; s++) {
                        if (tweet.source == acceptedSources[s]) {
                            if (p.verbose == 'debug') {
                                console.log('... DEBUGLOG checkSource === found - continue to analyze');
                            }
                            found = true;
                            break;
                        }
                    }
                    // dont continue when we dont want to track this source
                    if (found == false) {
                        rNumFilteredSource++;
                        if (p.verbose == 'debug') {
                            console.log('... DEBUGLOG checkSource === not found - take another');
                        }
                        return;
                    }
                }

                /**
                 * recast string tweet.created_at to date
                 */
                if (p.castDateString) {
                    // var dateNow = new Date().toISOString();

                    // console.log(dateNow, tweet.lang, tweet.user.lang, tweet.text);
                    // 2016-07-29T22:51:03.563Z
                    // console.log('cas s moment je ... ', moment(tweet.created_at, 'YYYY-MM-DDTHH:mm:ss', 'en'));
                    var m = new Date(Date.parse(tweet.created_at.replace(/( \+)/, ' UTC$1')));
                    // var tweetDate = 'Mon Dec 02 23:45:49 +0000 2013';
                    // var m = Date.parse(tweetDate);
                    if (p.verbose == 'debug') {
                        console.log(tweet.created_at, tweet.date, tweet.date.toUTCString());
                    }
                }

                /**
                 * detect language
                 */
                if (p.checkLanguage == true) {
                    if (p.verbose === 'debug') console.log('checkLanguage is set to ... ', p.checkLanguage);

                    var francRes = franc(tweet.text);
                    // console.log(francRes); // 'eng', 'nld', 'und' ...
                    tweet.francR = francRes;

                    // if (tweet.francR == 'deu') console.log('franc je DE', tweet.text);
                    // if (tweet.francR == 'cze') console.log('franc je CZE', tweet.text);
                }

                /**
                 * calculate text sentiment value
                 */
                if (p.calcSentiment == true) {
                    if (p.verbose === 'debug') console.log('calcSentiment is set to ... ', p.calcSentiment);

                    if (tweet.lang === 'en' /*&& francRes === 'eng'*/) {
                        var sentResEn = sentiment(tweet.text);
                        tweet.sentR = sentResEn;

                        /*
                         en en FUCK I ACCIDNETSLLY SCROLLED ALL THE WAY UP I HATE SAFARI
                         { score: -7,
                         comparative: -0.6363636363636364,
                         tokens:
                         [ 'fuck',
                         'i',
                         'accidnetslly',
                         'scrolled',
                         'all',
                         'the',
                         'way',
                         'up',
                         'i',
                         'hate',
                         'safari' ],
                         words: [ 'hate', 'fuck' ],
                         positive: [],
                         negative: [ 'hate', 'fuck' ] }
                         */
                    }

                    if (tweet.lang === 'de' /*&& francRes === 'deu'*/) {
                        var sentResDe = ml.classify(tweet.text);
                        tweet.sentR = sentResDe;
                        console.log('NEMECKY JAZYK ´=======================', sentResDe);
                        console.log(p.calcSentiment, tweet.lang, tweet.text);
                    }

                }


                if (p.calcPlaceCenter == true) {
                    if (p.calcPlaceCenterL == 'all') {

                        if (tweet.place != undefined) {

                            var center = geolib.getCenter([
                                {
                                    latitude: tweet.place.bounding_box.coordinates["0"]["0"]["0"],
                                    longitude: tweet.place.bounding_box.coordinates["0"]["0"]["1"]
                                },
                                {
                                    latitude: tweet.place.bounding_box.coordinates["0"]["2"]["0"],
                                    longitude: tweet.place.bounding_box.coordinates["0"]["2"]["1"]
                                }
                            ]);

                            var distance = geolib.getDistance(
                                {
                                    latitude: 51.5103,
                                    longitude: 7.49347
                                },
                                {
                                    latitude: "51° 31' N",
                                    longitude: "7° 28' E"
                                }
                            );

                            // tweet.place.bounding_box =
                            console.log('center is', center); // { latitude: '-62.977546', longitude: '-147.366400' }
                            console.log('distance is ', distance);

                            tweet.pCenter = [{}];
                            tweet.pDist = distance;
                        }
                    }
                }

                /**
                 * TODO calculate local time from coordinates
                 */
                if (p.calcLocalTime == true) {

                    // only if there are no coordinates and only "tweet.place" geolocolation type
                    if (tweet.coordinates == undefined) {

                        if (tweet.place != undefined) {

                            // var countryCode = place.country_code; // US, EN, DE, etc.
                            console.log ( tz(tweet.pCenter.lat, tweet.pCenter.lon) );
                        }

                        // spocitej ze souradnic casovou zonu
                    } else {
                        var lon = tweet.coordinate.coordinate[1];
                        var lat = tweet.coordinate.coordinate[0];

                        // Determine the timezone of the White House
                        console.log(tz(lat, lon));
                    }
                    // tweet.localT = resLocalT;
                }

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

                    MongoClient.connect(connStringMongo, function (err, db) {
                        if (err) throw err;

                        db.collection('sample', function (error, collection) {
                            var sampleCollection = collection;
                        })

                    });
                } else if (accessLevel === 'stream') {

                    MongoClient.connect(connStringMongo, function (err, db) {
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

                //
                // stream a sample of public statuses
                //

                // TODO
                openDb('sample');

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

            }

            if (p.verbose == 'production') {
                // TODO
                openDb('THIS IS PRODUCTION MODE');

                //if (p.verbose == 'debug') {
                //    var stream = T.stream('statuses/sample');
                //} else if (p.verbose == 'production') {
                //
                //}
                //
                var stream = T.stream('statuses/filter', {
                    // track: p.track,
                    locations: p.locations
                });
                // var stream = T.stream('statuses/sample');

                var rawTweets = [];

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
                    console.log(sampleSizeCounter);
                    /**
                     * tweet - input
                     * tweet - output
                     */
                    processTweet(tweet);
                    rawTweets.push(tweet);
                    // save tweet
                    // saveToDb(tweet);

                    sampleSizeCounter++;
                    // stop if there is enought tweets
                    if (sampleSizeCounter == p.sampleSize) {
                        console.log('zastavuji proud');
                        stream.stop();
                        calcStreamStats(rawTweets);
                        callback();
                    }
                });
            }
        },

        /**
         *
         * SIXTH ASYNC STEP
         *  DO STATISTICS
         */
        this.calcStatsDb = function (callback) {
            console.log('... calcStats() ===     pocitam statistiky z databaze');
            //console.log('... total / rNumIn / rNumOut', rNumTotal, rNumIn, rNumOut);
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