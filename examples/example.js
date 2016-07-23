var TSMG = require('../twitterSMG.js');
// var Twit = require('twit');


var parameters = {
    track: 'mango',
    locations: ['-122.75', '36.8', '-121.75', '37.8'], // var world = [ '-180.0 , -90.0 , 180.0 , 90.0' ];
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
    consumer_key: 'ieEKT1apDrIcnjlt8wR4yOqFf', // pouzivane 'h5EUsV1oaCF3Zqi7vwK3Il07v',
    consumer_secret: 'ADIObvcQvp8x01jaMFX4iD5oCW9VB5noY9NW6jS558BMhY6n0t', // pouzivane 'KEvWeD9ZWk1LO8pjtBMblYCfvF1E4keZ4y6Uap15MsJe50hYAQ',
    access_token: '120722111-AXtwB0S08MjOJbYJ19sQHxMbLqaFihARLAr0V7hg', // pouzivanne '2832363724-FLoz3awEnhL9xFa1gApfbgFxaVjCc2FheIrlReG',
    access_token_secret: 'atThRDUy5ARU6VgvuO8a7YsqkKWhF1T4MmuH1WYh28QYK', // pouzivane 'iqmAyOKWYTu6J5LwDnp2oLpruxaVENwm1TddFUDG9Reh1',
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
    verbose: 'debug'
};

TSMG.twitterSMG(parameters);


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