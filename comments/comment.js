
// EXAMPLEFILE

// var Twit = require('twit');

// require('dotenv').load();

// I AM USING ENV FOR ACCESS KEYS - TYPE YOUR OWN
// https://github.com/motdotla/dotenv
// require('dotenv').config();

// consumer_key: process.env.EnvVarConsumerKey,
// consumer_secret: process.env.EnvVarConsumerSecret,
// access_token: process.env.EnvVarAcessToken,
// access_token_secret: process.env.EnvVarAcessTokenSecret,

// console.log(process.env.EnvVarAcessToken);












// POZNAMKA U ZAHAJENI STAHOVANI
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











// var flog = function (a) {
//     return console.log(a);
// };


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