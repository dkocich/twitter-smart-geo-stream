var TSGS = require('../twitterSGS.js');
// var Twit = require('twit');

// require('dotenv').load();

// I AM USING ENV FOR ACCESS KEYS - TYPE YOUR OWN
// https://github.com/motdotla/dotenv
require('dotenv').config();

var parameters = {
    // Twitter backend
    track: 'apple',
    locations: ['-180.0','-90.0','180.0','90.0'] , // var world = ; ['-125.75', '20.8', '-101.75', '50.8']

    // Access and Twit module settings
    
    // consumer_key: process.env.EnvVarConsumerKey,//'ieEKT1apDrIcnjlt8wR4yOqFf', // pouzivane 'h5EUsV1oaCF3Zqi7vwK3Il07v',
    // consumer_secret: process.env.EnvVarConsumerSecret, // 'ADIObvcQvp8x01jaMFX4iD5oCW9VB5noY9NW6jS558BMhY6n0t', // pouzivane 'KEvWeD9ZWk1LO8pjtBMblYCfvF1E4keZ4y6Uap15MsJe50hYAQ',
    // access_token: process.env.EnvVarAcessToken, // '120722111-AXtwB0S08MjOJbYJ19sQHxMbLqaFihARLAr0V7hg', // pouzivanne '2832363724-FLoz3awEnhL9xFa1gApfbgFxaVjCc2FheIrlReG',
    // access_token_secret: process.env.EnvVarAcessTokenSecret, //'atThRDUy5ARU6VgvuO8a7YsqkKWhF1T4MmuH1WYh28QYK', // pouzivane 'iqmAyOKWYTu6J5LwDnp2oLpruxaVENwm1TddFUDG9Reh1',

    consumer_key: 'ieEKT1apDrIcnjlt8wR4yOqFf', // pouzivane 'h5EUsV1oaCF3Zqi7vwK3Il07v',
    consumer_secret: 'ADIObvcQvp8x01jaMFX4iD5oCW9VB5noY9NW6jS558BMhY6n0t', // pouzivane 'KEvWeD9ZWk1LO8pjtBMblYCfvF1E4keZ4y6Uap15MsJe50hYAQ',
    access_token: '120722111-AXtwB0S08MjOJbYJ19sQHxMbLqaFihARLAr0V7hg', // pouzivanne '2832363724-FLoz3awEnhL9xFa1gApfbgFxaVjCc2FheIrlReG',
    access_token_secret: 'atThRDUy5ARU6VgvuO8a7YsqkKWhF1T4MmuH1WYh28QYK', // pouzivane 'iqmAyOKWYTu6J5LwDnp2oLpruxaVENwm1TddFUDG9Reh1',

    timeout_ms: 10 * 1000,  // optional HTTP request timeout to apply to all requests.

    sampleSize:5,

    // MongoDB
    useMongoDB: false,
    hostMongo: 'localhost',
    portMongo: '27017',
    dbMongo: 'twittersgs',

    // PostgreSQL
    usePg: false,
    hostPg: 'localhost',
    portPg: '5432',
    dbPg: 'twittersgs',

    inclRetweets: true, 
    
    checkSource: true,
    sourceType: 'human',
    tweetSaveSize: 'full', // small / medium
    calcStats: true,
    
    castDateString: true,
    checkLanguage: true,
    calcSentiment: true,

    calcPlaceCenter: true,
    calcPlaceCenterL: 'all', // 'country' 'city' 'neighbourhood' 'poi'
    checkByLocation: true,
    calcLocalTime: true,
    
    checkSpam: false,
    
    buildUserNetwork: true,
    buildTopicNetwork: true,
    
    geoparse: true,
    
    verbose: 'production' //debug
};

console.log(process.env.EnvVarAcessToken);

TSGS.twitterSGGstart(parameters);