var TSMG = require('../twitterSMG.js');
// var Twit = require('twit');

// require('dotenv').load();

// I AM USING ENV FOR ACCESS KEYS - TYPE YOUR OWN
// https://github.com/motdotla/dotenv
require('dotenv').config();

var parameters = {
    // Twitter backend
    track: 'mango',
    locations: ['-125.75', '20.8', '-101.75', '50.8'], // var world = [ '-180.0 , -90.0 , 180.0 , 90.0' ];

    // Access and Twit module settings
    consumer_key: process.env.EnvVarConsumerKey,//'ieEKT1apDrIcnjlt8wR4yOqFf', // pouzivane 'h5EUsV1oaCF3Zqi7vwK3Il07v',
    consumer_secret: process.env.EnvVarConsumerSecret, // 'ADIObvcQvp8x01jaMFX4iD5oCW9VB5noY9NW6jS558BMhY6n0t', // pouzivane 'KEvWeD9ZWk1LO8pjtBMblYCfvF1E4keZ4y6Uap15MsJe50hYAQ',
    access_token: process.env.EnvVarAcessToken, // '120722111-AXtwB0S08MjOJbYJ19sQHxMbLqaFihARLAr0V7hg', // pouzivanne '2832363724-FLoz3awEnhL9xFa1gApfbgFxaVjCc2FheIrlReG',
    access_token_secret: process.env.EnvVarAcessTokenSecret, //'atThRDUy5ARU6VgvuO8a7YsqkKWhF1T4MmuH1WYh28QYK', // pouzivane 'iqmAyOKWYTu6J5LwDnp2oLpruxaVENwm1TddFUDG9Reh1',
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.

    // MongoDB
    useMongoDB: true,
    hostMongo: 'localhost',
    portMongo: '27017',
    dbMongo: 'twittersmg',

    // PostgreSQL
    usePg: true,
    hostPg: true,
    portPg: true,
    dbPg: true,

    sampleSize: 1,
    tweetSaveSize: 'full', // small / medium
    calcStats: true,


    castDateString: true,
    checkLanguage: true,
    calcSentiment: true,
    checkSource: true,
    sourceType: 'human',
    checkSpam: false,
    checkByLocation: false,

    verbose: 'production' //debug
};

console.log(process.env.EnvVarAcessToken);

TSMG.twitterSMGstart(parameters);

// FUNGUJE
// var T = new Twit({
//         consumer_key: "ieEKT1apDrIcnjlt8wR4yOqFf",
//         consumer_secret: "ADIObvcQvp8x01jaMFX4iD5oCW9VB5noY9NW6jS558BMhY6n0t",
//         access_token: "120722111-AXtwB0S08MjOJbYJ19sQHxMbLqaFihARLAr0V7hg",
//         access_token_secret: "atThRDUy5ARU6VgvuO8a7YsqkKWhF1T4MmuH1WYh28QYK",
//         timeout_ms: 60000
//     });
//
// var stream = T.stream('statuses/sample', {track: 'mango'});
//
// stream.on('tweet', function (tweet) {
//         return console.log(tweet);
// });