/**
 * Created by David on 23. 8. 2016.
 */

var MongoClient = require('mongodb').MongoClient;
var async = require("async");

var currentDb;

async.series([

    this.st1 = function (callback) {

        MongoClient.connect('mongodb://localhost:27017/twittersgs', {
            poolSize: 10, ssl: false
        }, function (err, db) {
            // end on error connecting?
            if (err) throw err;

            // db.collection('data', function (error, collection) {
            //     collection.insertOne({"aaa": "bbb"});
            // });

            console.log('finish1');
            currentDb = db;
            callback();

        });

    },

    this.st2 = function (callback) {

        for (i = 0; i < 100000; i++) {
            
            // FUNGUJE

            currentDb.collection('data1', function (error, collection) {
                var a = Math.random().toString(36).substring(7);
                var b = Math.random();
                var tw = { a : b };
                collection.insertOne();
                // console.log('finish2' , tw);
            });

        }

        callback();
    }
]);