var async = require("async");

//funguje
var Twit = require('twit');

var T = new Twit({
    consumer_key: 'ieEKT1apDrIcnjlt8wR4yOqFf',
    consumer_secret: 'ADIObvcQvp8x01jaMFX4iD5oCW9VB5noY9NW6jS558BMhY6n0t',
    access_token: '120722111-AXtwB0S08MjOJbYJ19sQHxMbLqaFihARLAr0V7hg',
    access_token_secret: 'atThRDUy5ARU6VgvuO8a7YsqkKWhF1T4MmuH1WYh28QYK',
    timeout_ms: 60 * 1000  // optional HTTP request timeout to apply to all requests.
});

var stream = T.stream('statuses/sample');

async.series([

    this.testStart = function (callback) {
        console.log('... DEBUGLOG start() === spusteno');
        callback();
    },

    this.stream = function (callback) {

        var c = 0;
        stream.on('tweet', function (tweet) {

            var date = new Date().toISOString();
            //console.log(date, tweet.lang, tweet.user.lang, tweet.text);

            c++;

            if (c == 50) {
                console.log('loggg', c, date);
                callback();
            }
        });
    },

    this.testStop = function (callback) {
        console.log('... DEBUGLOG konec === ukonceno');
        callback();
    }

]);

console.log('budu drive nez cela serie');

