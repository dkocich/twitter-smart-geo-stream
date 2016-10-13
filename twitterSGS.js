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
  franc = require('franc'),
  geolib = require('geolib'),
  MongoClient = require('mongodb').MongoClient,
  ml = require('ml-sentiment')({lang: 'de'}),
  sentiment = require('sentiment'),
  turf = require('turf-center'),
  Twit = require('twit'),
  tz = require('tz-lookup');

const fs = require('fs');
const profiler = require('v8-profiler');


var databaseCleaner = new DatabaseCleaner('mongodb');
var connect = require('mongodb').connect;

// Package version
const VERSION = require('./package.json').version;
console.log(VERSION);

const tweetSources = require('./data/tweetSources.js').tweetSources;
const cities15000 = require('./geonames/cities15000.js').cities15000;
// ----- console.log(tweetSources.length); // 1151

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
var twitterSGSstart = function (parameters) {
  var p = parameters;
  var connStringMongo, connStringPg;

  var aliveMongoConn;

  var rNTweetsIn = 0,
    rNTweetsSaved = 0,
    rNLimitIn = 0,
    rNumPassed = 0,
    rNumLang = 0,
    rNumMove = 0,
    rNumFilteredSource = 0,
    sampleSizeCounter = 0;

  // rNTotal,
  // rNIn,
  // rNOut,

  var acceptedSources = [];

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

      if (p.verbose == undefined) p.verbose = 'production';

      // log all parameters
      if (p.verbose === 'debug') {
        console.log('... DEBUGLOG ===== STARTING WITH THESE PARAMS ===== ');
        console.log(p);
      }

      // set default values for non-set parameters
      if (p.track == undefined) p.track = '';
      if (p.lang == undefined) p.lang = '';
      if (p.locations == undefined) p.locations = ['-180.0 , -90.0 , 180.0 , 90.0'];

      if (p.sampleSize == undefined) p.sampleSize = 100;
      if (p.calcStats == undefined) p.calcStats = false;
      if (p.verbose == undefined) p.verbose = 'debug';

      /* Twitter access and Twit module settings
       * GRAB YOUR KEYS AT https://apps.twitter.com/
       */
      // detect missing access keys and finish
      if (p.consumer_key == undefined || p.consumer_secret == undefined ||
        p.access_token == undefined || p.access_token_secret == undefined) {
        throw new Error('MISSING ACCESS KEYS');
      }
      if (p.timeout_ms == undefined) p.timeout_ms = 60 * 1000;


      /*
       * STORAGE CONNECTION
       */
      if (p.createNewDb == undefined) p.createNewDb = false;
      if (p.indexMongo == undefined) p.indexMongo = false;
      if (p.indexPg == undefined) p.indexPg = false;
      // MongoDB
      if (p.useMongoDB == undefined) p.useMongoDB = false;
      if (p.hostMongo == undefined) p.hostMongo = 'localhost';
      if (p.portMongo == undefined) p.portMongo = '27017';
      if (p.dbMongo == undefined) p.dbMongo = 'twittersgs';
      // PostgreSQL
      if (p.usePg == undefined) p.usePg = false;
      if (p.hostPg == undefined) p.hostPg = 'localhost';
      if (p.portPg == undefined) p.portPg = '5432';
      if (p.dbPg == undefined) p.dbPg = 'twittersgs';

      // init connection string to MongoDB + PostgreSQL
      connStringMongo = 'mongodb://' + p.hostMongo + ':' + p.portMongo + '/' + p.dbMongo;
      connStringPg = 'postgresql://' + p.hostPg + ':' + p.portPg + '/' + p.dbPg;

      // mongodb://localhost:27017/twittersgs
      // postgresql://localhost:5432/twittersgs
      if (p.verbose == 'debug') console.log(connStringMongo + '\n' + connStringPg);

      /*
       *  FILTER
       */
      if (p.inclRetweets == undefined) p.inclRetweets = true;

      if (p.checkContent == undefined) p.checkCountent = false;
      if (p.contentWord == undefined) p.contentWord = false;


      if (p.checkSource == undefined) p.checkSource = false;
      // set filtering of tweets source applications
      if (p.checkSource) {
        for (var i = 0; i < tweetSources.length; i++) {
          if (tweetSources[i].c == p.sourceType) {
            acceptedSources.push(tweetSources[i].idl);
          }
        }
      }
      if (p.sourceType == undefined) p.sourceType = 'all';
      // category of source classification
      // for details see './data/tweetSource.csv' - 'all' 'human' 'web device'
      // 'mobile devices' 'meteo' 'earthquakes' 'trends' 'traffic'

      if (p.checkSpam == undefined) p.checkSpam = false;
      if (p.checkByLocation == undefined) p.checkByLocation = false;

      /*
       *  IMPROVE and REPAIR
       */
      if (p.calcPlaceCenter == undefined) p.calcPlaceCenter = false;
      if (p.calcPlaceCenterL == undefined) p.calcPlaceCenterL = 'all';

      if (p.castDateString == undefined) p.castDateString = false;
      if (p.calcLocalTime == undefined) p.calcLocalTime = false;

      if (p.checkLanguage == undefined) p.checkLanguage = false;
      if (p.calcSentiment == undefined) p.calcSentiment = false;

      /*
       *  OPTIMIZE
       */
      if (p.geoparse == undefined) p.geoparse = false;
      if (p.tweetSaveSize == undefined) p.tweetSaveSize = 'full';
      if (p.delUserMd == undefined) p.delUserMd = false;
      if (p.delPlaceMd == undefined) p.delPlaceMd = false;

      /*
       * CREATE DERIVED DATASETS
       */
      if (p.buildUserNetwork == undefined) p.buildTopicNetwork = false;
      if (p.buildTopicNetwork == undefined) p.buildTopicNetwork = false;
      if (p.buildUserDb == undefined) p.buildUserDb = false;
      if (p.buildPlaceDb == undefined) p.buildPlaceDb = false;

      callback();
    },

    /**
     *
     * THIRD ASYNC STEP
     * clean old databases from MongoDB
     */
    this.cleanDb = function (callback) {

      // clean only on debug to prevent from loosing data

      if (p.useMongoDB || p.usePg) {

        if (p.useMongoDB) {
          if (p.verbose == 'debug') {
            console.log('...cleanDb() ===      ', connStringMongo);
            console.log('...cleanDb() ===       cleaning and closing DB connection');
          }
          if (p.createNewDb) {
            connect(connStringMongo, function (err, db) {
              // delete all collections in DB
              databaseCleaner.clean(db, function () {
                db.close();
                callback(); // clear and end in debug
              });
            });
          } else {
            callback();
          }
        }

        if (p.usePg) {
          // TODO CLEAN POSTGRES DB+TABLES IF EXIST
        }
        // end if no database is selected directly in production
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
        MongoClient.connect(connStringMongo, {poolSize: 10, ssl: false}, function (err, db) {

          aliveMongoConn = db;

          // end on error connecting?
          if (err) throw err;

          var date = new Date();
          // var nameStr = date.getFullYear() + ('0' + (date.getMonth() + 1 )).slice(-2) + date.getUTCDate();
          console.log('...initDb() ===        connected to ', p.dbMongo);

          // create collections with timestamp
          db.createCollection('unclassified', {autoIndexId: false}, function (err, collection) {
            if (err) throw err;
          });
          db.createCollection('spambots', {autoIndexId: false}, function (err, collection) {
            if (err) throw err;
          });
          db.createCollection('sampleResult' /*+ nameStr*/, {autoIndexId: false}, function (err, collection) {
            if (err) throw err;
          });
          db.createCollection('data' /*+ nameStr*/, {autoIndexId: false}, function (err, collection) {
            if (err) throw err;
          });
          db.createCollection('limitMsg' /*+ nameStr*/, {autoIndexId: false}, function (err, collection) {
            if (err) throw err;
          });

          // TODO MONGODB CREATE INDEX on id_str ... user.id_str ... date ... jeste neco ???
          // INTELLISHELL EXAMPLE
          //
          db.collection('data').ensureIndex({"user.id_str": 1}, function (err, result) {
            console.log('... log - index created on data / user.id_str');
          });
          db.collection('data').ensureIndex({"id_str": 1 } , {unique: true}, function (err, result) {
            console.log('... log - index created on data / id_str');
          });
          db.collection('data').ensureIndex({"lang": 1}, function (err, result) {
            console.log('... log - index created on data / lang');
          });
          db.collection('data').ensureIndex({"place.country_code": 1}, function (err, result) {
            console.log('... log - index created on data / place.country_code');
          });
          db.collection('data').ensureIndex({"created_at": 1}, function (err, result) {
            console.log('... log - index created on data / created_at');
          });
          db.collection('limitMsg').ensureIndex({"timestamp": 1}, function (err, result) {
            console.log('... log - index created on limitMsg / timestamp_ms');
          });
          // db.sample.createIndex({
          //     "id_str": 1 , {unique: true}
          // });
          //
          // db.sample.createIndex({
          //     "date": 1
          // });
          //
          // db.sample.createIndex({
          //     "id_str": 1 , "date" {unique: true}
          // });

          if (p.verbose == 'debug') {
            console.log(date);
            console.log('... initDb() ===        created collections in mongodb' + p.sampleSize);
          }
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
      console.log('... sample() ===        sampling OR streaming begins - init connection');

      // init Twitter connection keys
      var T = new Twit({
        consumer_key: p.consumer_key,
        consumer_secret: p.consumer_secret,
        access_token: p.access_token,
        access_token_secret: p.access_token_secret,
        timeout_ms: p.timeout_ms  // optional HTTP request timeout to apply to all requests.
      });

      /**
       * calculates all kinds of other parameters
       * @param tweet Object - One incoming tweet
       * @return processedTweet Object - updated/repaired tweet
       * OR
       * @return false Boolean - if tweet is filtered
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
            rNumFilteredSource++; // one more filtered out
            if (p.verbose == 'debug') {
              console.log('... DEBUGLOG checkSource === not found - take another');
            }
            return false;
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
          tweet.date = new Date(Date.parse(tweet.created_at.replace(/( \+)/, ' UTC$1')));
          // var tweetDate = 'Mon Dec 02 23:45:49 +0000 2013';
          // var m = Date.parse(tweetDate);
          if (p.verbose == 'debug') {
            console.log(tweet.created_at, tweet.date, tweet.date.toUTCString());
          }
        }

        /**
         * detect language
         */
        if (p.checkLanguage) {
          if (p.verbose === 'debug') console.log('checkLanguage is set to ... ', p.checkLanguage);

          // var francRes = franc(tweet.text);
          // console.log(francRes); // 'eng', 'nld', 'und' ...

          tweet.francR = franc(tweet.text);
          ;

          // if (tweet.francR == 'deu') console.log('franc je DE', tweet.text);
          // if (tweet.francR == 'cze') console.log('franc je CZE', tweet.text);
        }

        /**
         * calculate text sentiment value
         */
        if (p.calcSentiment) {
          if (p.verbose === 'debug') console.log('calcSentiment is set to ... ', p.calcSentiment);

          if (tweet.lang === 'en' /*&& francRes === 'eng'*/) {
            // var sentResEn = sentiment(tweet.text);
            tweet.sentR = sentiment(tweet.text);

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
            if (p.verbose === 'debug') {
              console.log('GERMAN LANGUAGE ´=======================', sentResDe);
              console.log(p.calcSentiment, tweet.lang, tweet.text);
            }
          }
        }

        if (p.calcPlaceCenter) {

          /**
           * place containts bounding box of country / region / city / neighbourhood
           * and we want to save only point (for some of these types)
           */
          if (p.calcPlaceCenterL == 'all') {

            if (tweet.place !== null && tweet.place_type !== 'POI') {
              // get values from tweet BBOX array
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

              if (p.verbose === 'debug') console.log('center is', center); // { latitude: '-62.977546', longitude: '-147.366400' }
              tweet.pCenter = center;

            }
            // if (tweet.coordinates != null) {
            //     if (tweet.coordinates.coordinates != null) {
            //         console.log(tweet.coordinates.coordinates);
            //     }
            // }

            if (tweet.coordinates !== null) {
              if (typeof tweet.coordinates.coordinates === 'object') {
                if (p.verbose === 'debug') console.log(tweet.coordinates.coordinates);
                var distance = geolib.getDistance(
                  {
                    latitude: center.latitude, // 51.5103,
                    longitude: center.longitude // 7.49347
                  },
                  {
                    latitude: tweet.coordinates.coordinates[0],
                    longitude: tweet.coordinates.coordinates[1]
                  }
                );

                if (p.verbose === 'debug') console.log('distance is ', distance);
                tweet.pDistance = distance;
              }
            }

          }
        }

        /**
         * if we have both types of geolocation:
         * --- GPS COORDINATES (lat/lon)
         * --- PLACE LOCALIZATION WITH BOUNDING BOX
         */
        if (p.checkByLocation) {
          if (tweet.coordinates !== null && tweet.place !== null) {

            if (p.verbose === 'debug') {
              console.log(
                tweet.place.bounding_box.coordinates["0"]["0"]["0"],
                tweet.place.bounding_box.coordinates["0"]["0"]["1"],
                tweet.place.bounding_box.coordinates["0"]["2"]["0"],
                tweet.place.bounding_box.coordinates["0"]["2"]["1"]
              );
              console.log(tweet.coordinates.coordinates[0], tweet.coordinates.coordinates[1]);
            }

            // FOR VERIFICATION OF CORRECT ORDER - 2 examples

            // -69.238144   9.514141   -69.173592   9.584418
            // -69.194047   9.55847

            // 29.080789 40.405603 29.189454 40.482914
            // 29.1695263 40.4364484

            if (tweet.coordinates.coordinates[0] > tweet.place.bounding_box.coordinates["0"]["0"]["0"]
              &&
              tweet.coordinates.coordinates[0] < tweet.place.bounding_box.coordinates["0"]["2"]["0"]) {

              if (tweet.coordinates.coordinates[1] > tweet.place.bounding_box.coordinates["0"]["0"]["1"]
                &&
                tweet.coordinates.coordinates[1] < tweet.place.bounding_box.coordinates["0"]["2"]["1"]) {

                if (p.verbose === 'debug') {
                  console.log('BOD JE UVNITR');
                }
                tweet.pInside = true;
              }
            }
          }
        }

        if (p.inclRetweets === false) {
          if (tweet.retweeted) {
            console.log(tweet.retweeted);
            return false;
          }
        }

        // if (p.buildUserNetwork) {
        //     if (tweet.entities.user_mentions !== undefined) {
        //         var from = tweet.user.id_str;
        //         var to = tweet.entities.user_mentions[0].id_str;
        //         // TODO DEJ DO DB
        //     }
        // }
        //
        // if (p.buildTopicNetwork) {
        //     if (tweet.entities.hashtags !== undefined) {
        //         var from = tweet.user.id_str;
        //         var to = tweet.entities.hashtags[0].text;
        //         // TODO DEJ DO DB
        //     }
        // }

        if (p.buildUserDb) {
          // TODO put user data to separate collection and update it (f.e. 1 hour each day?)
        }

        if (p.buildPlaceDb) {
          // TODO put place metadata to separate collection
        }

        // look for place names in tweet text
        if (p.geoparse) {
          //
          // // TODO
          // // geonames a searchindex
          // // https://github.com/olivernn/lunr.js
          //
          // console.log(tweet.text);
          // var res = tweet.text.split(" ");
          // // console.log(res);
          // // var a = tweet.sentR.tokens;
          //
          // res.forEach(function (token) {
          //     if (token.match(/[A-Z]*$/) ) {
          //         console.log('VELKE PISMENOOOO', token);
          //     }
          // })

        }


        /**
         * TODO calculate local time from coordinates
         */
        if (p.calcLocalTime == true) {

          // only if there are no coordinates and only "tweet.place" geolocolation type
          if (tweet.coordinates !== null) {
            var lat = tweet.coordinates.coordinates[0];
            var lon = tweet.coordinates.coordinates[1];

            // Determine the timezone of the White House

            try {
              tweet.tz = tz(lat, lon);
            } catch (e) {
              // if (e instanceof TypeError) {
              //     // ignore TypeError
              // }
              // else
              if (e instanceof RangeError) {
                console.log(e);
                console.log('lat is: ', lat, 'lon is', lon);
                // handle RangeError
              }
              // else {
              //     // something else
              // }
            }

            // spocitej ze souradnic casovou zonu
          } else if (tweet.place !== null) {
            // var countryCode = place.country_code; // US, EN, DE, etc.
            tweet.tz = tz(tweet.pCenter.latitude, tweet.pCenter.longitude);
          }
          if (p.debug == 'debug') console.log(tweet.tz);
          // var a = new Date().toLocaleString("en-US", {timeZone: tweet.tz });
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

        if (p.tweetSaveSize !== 'full') {
          // full - medium - small
          var saveTweet = {};

          if (p.tweetSaveSize === 'medium') {

            saveTweet.id_str = tweet.id_str;
            saveTweet.user.id_str = tweet.user.id_str;
            saveTweet.created_at = tweet.created_at;
            saveTweet.coordinates = tweet.coordinates;
            saveTweet.lang = tweet.lang;
            saveTweet.text = tweet.text;
            saveTweet.entities = tweet.entities;

            return saveTweet;

          } else if (p.tweetSaveSize === 'small') {

            saveTweet.id_str = tweet.id_str;
            saveTweet.user.id_str = tweet.user.id_str;
            saveTweet.created_at = tweet.created_at;
            saveTweet.coordinates = tweet.coordinates;

            return saveTweet;
          }
        }

        return tweet;
      };

      // TODO rozhodnout se co s timto
      // open database only ONCE and then JUST INSERT data
      // var openDb = function (accessLevel) {
      //
      //
      //     if (accessLevel === 'sample') {
      //         var dataCollection;
      //
      //         MongoClient.connect(connStringMongo, function (err, db) {
      //             if (err) throw err;
      //
      //             db.collection('sample', function (error, collection) {
      //                 dataCollection = collection;
      //                 return dataCollection;
      //             })
      //
      //         });
      //     } else if (accessLevel === 'stream') {
      //
      //         MongoClient.connect(connStringMongo, function (err, db) {
      //             if (err) throw err;
      //
      //             db.collection('data', function (error, collection) {
      //                 dataCollection = collection;
      //                 return dataCollection;
      //             })
      //
      //         });
      //     }
      //
      // };


      /**
       *
       * @param tweet Object - one incoming tweet to be saved
       */
      var saveToDb = function (tweet) {
        if (tweet != null) {
          // using opened connection
          aliveMongoConn.collection('data', function (error, collection) {
            collection.insertOne(tweet);
            rNTweetsSaved++;
            // if (p.verbose == 'debug') {
            console.log("Insert: " + tweet.id_str);
            // }
          });
        }
      };

      var calcStreamStats = function (rawTweets) {
        var rNTweetsFiltered = rNTweetsIn - rNTweetsSaved;
        console.log('pocitanim aktualni statistiku rawTweets ', rawTweets.length);

        console.log(
          ' rNLimitIn             = # of limit msg. received  ', rNLimitIn + '\n',
          ' rNTweetsIn            = # of tw. received         ', rNTweetsIn + '\n',
          ' rNTweetsSaved         = # of tw. saved to DB      ', rNTweetsSaved + '\n',
          ' rNTweetsFiltered      = # of tw. thrown away      ', rNTweetsFiltered + '\n',
          ' sampleSizeCounter     = # of tw. received         ', sampleSizeCounter + '\n',
          ' rNumFilteredSource    = # of tw. filt. by Source  ', rNumFilteredSource + '\n',
          ' # of tweets passed                                ', rNumPassed + '\n',
          ' # of tweets wrong language                        ', rNumLang + '\n',
          ' # of tweets coordinates moving around world       ', rNumMove + '\n'
        );

        var users = {};
        for (var i = 0; i < rawTweets.length; i++) {
          users[rawTweets[i].user.id_str] = 1 + (users[rawTweets[i].user.id_str] || 0);
        }

        console.log(' Total users ', users.length);

      };

      /*
       ===================== DEBUG STREAMING ONLY
       */
      if (p.verbose == 'debug') {
        console.log('THIS IS DEBUG MODE');

        // var dataCollection = openDb('sample');

        //
        // stream a sample of public statuses
        //
        var stream = T.stream('statuses/sample');

        stream.on('tweet', function (tweet) {
          var date = new Date().toISOString();
          console.log(date, tweet.lang, tweet.user.lang, tweet.text);
          sampleSizeCounter++;

          if (sampleSizeCounter === p.sampleSize) {
            stream.stop();
            callback();
          }

          processTweet(tweet);
          saveToDb(tweet);
        });

      } else

      /*
       ===================== PRODUCTION STREAMING ONLY
       */
      if (p.verbose == 'production') {
        // var dataCollection = openDb('production');

        var stream = T.stream('statuses/filter', {
          track: p.track,
          lang: p.lang,
          locations: p.locations
        });

        var rawTweets = [];

        /**
         * VARIOUS STREAM EVENTS DESCRIBED AT TWIT MODULE
         * */
        stream.on('error', function (error) {
          var date = new Date().toISOString();
          if (p.verbose == 'debug' ) console.log(date + '.....LOG EVENT ERROR');
          if (p.useMongoDB) {
            aliveMongoConn.collection('errorMsg', function (error, collection) {
              collection.insertOne(error);
            });
          }
          throw error;
        });
        stream.on('limit', function (limitMsg) {
          rNLimitIn++;
          var date = new Date().toISOString();
          if (p.verbose == 'debug' ) console.log(date + ' .....LOG EVENT LIMIT ' + limitMsg);
          if (p.useMongoDB) {
            aliveMongoConn.collection('limitMsg', function (error, collection) {
              collection.insertOne(limitMsg);
            });
          }
          return console.log(date + ' .....LOG EVENT LIMIT ' + JSON.stringify(limitMsg));
        });
        stream.on('warning', function (warningMsg) {
          var date = new Date().toISOString();
          if (p.useMongoDB) {
            aliveMongoConn.collection('warningMsg', function (error, collection) {
              collection.insertOne(warningMsg);
            });
          }
          return console.log(date + ' .....LOG EVENT WARNING warning is ' + warning);
        });
        stream.on('disconnect', function (disconnectMsg) {
          var date = new Date().toISOString();
          if (p.useMongoDB) {
            aliveMongoConn.collection('disconnectMsg', function (error, collection) {
              collection.insertOne(disconnectMessage);
            });
          }
          return console.log(date + ' .....LOG EVENT DISCONNECT disconnectMessage is ' + disconnectMessage);
        });
        stream.on('reconnect', function (request, response, connectInterval) {
          var date = new Date().toISOString();
          if (p.verbose == 'debug' ) {
            console.log(request);
            console.log(response);
            console.log(connectInterval);
            console.log(date + ' .....LOG EVENT RECONNECT connectInterval is ' + connectInterval);
          }
          throw new Error("Something went badly wrong - ending script. Forever - restart!!!");
        });
        stream.on('status_withheld', function (withheldMsg) {
          if (p.verbose == 'debug' ) console.log(date + ' .....LOG EVENT LIMIT ' + withheldMsg);
          var date = new Date().toISOString();
          if (p.useMongoDB) {
            aliveMongoConn.collection('sWithheldMsg', function (error, collection) {
              collection.insertOne(withheldMsg);
            });
          }
          return console.log(date + ' .....LOG EVENT STATUSWITHHELD statusWitheld is ' + withheldMsg);
        });
        stream.on('user_withheld', function (withheldMsg) {
          if (p.verbose == 'debug' ) console.log(date + ' .....LOG EVENT LIMIT ' + withheldMsg);
          var date = new Date().toISOString();
          if (p.useMongoDB) {
            aliveMongoConn.collection('uWithheldMsg', function (error, collection) {
              collection.insertOne(withheldMsg);
            });
          }
          return console.log(date + ' .....LOG EVENT USERWITHHELD userWitheld is ' + withheldMsg);
        });
        stream.on('connected', function (response) {
          if (p.verbose == 'debug' ) console.log(date + ' .....LOG EVENT LIMIT ' + response);
          var date = new Date().toISOString();
          // if (p.useMongoDB) {
          //   aliveMongoConn.collection('connectedMsg', function (error, collection) {
          //     collection.insertOne(response);
          //   });
          // }
          return console.log(date + ' .....LOG EVENT CONNECTED response is ' + response);
        });

        /**
         * MAIN PART AND LOGIC IS HERE
         */
        stream.on('tweet', function (tweet) {
          rNTweetsIn++;
          console.log(sampleSizeCounter);
          /**
           * tweet - input
           * tweet - output
           */
          var processedTweet = processTweet(tweet);

          // KEEP DATA TO CALCULATE SOMETHING LATER
          rawTweets.push(tweet);

          // pouze pokud se vrati tweet a ne "false" ktery znaci odfiltrovani zpravy, tak ulozim
          if (processedTweet != false) {
            saveToDb(processedTweet);
          }

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

      // TODO NEJAKE STATISTIKY Z DATABAZE NAPR V 15 MINUTOVYCH OKNECH A VYSLEDKY ZPRACOVAT A DATA VIC PROFILTROVAT

      //TODO NAJDI AUTORY S VIC NEZ 1 TWEETEM A ZJISTI ODCHYLKY V POLOZE -
      //TODO NAJDI SPAMY POMOCI DETEKCE JAZYKA - MENSI NEZ X PRISLUSNOST
      //TODO FUZZY HLEDANI SPAMERU PODLE PROFILU - CIM VIC TWEETU, DATUM ZALOZENI
    }
  ]);
};
// EXPORT MODULE'S FUNCTION
module.exports = {
  twitterSGGstart: twitterSGSstart
};