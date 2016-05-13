'use strict';

/**
 * Module dependencies
 */

require('mongodb');
require('twitter');
require('sentiment');

// Package version
var VERSION = require('../package.json').version;
console.log(VERSION);

class twitterSMG {

  sample() {
    console.log('sample');
  }

  start() {
    console.log('start');
  }

};

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
 *
 * @param  {String} connection string
 * @param {Number} sample size
 * @return {String}
 */

module.exports = {
  initiate: function ( params ) {
    return ; //Object(params)
  },
  connect: function ( host, db, collection) {
    return ; //Object(connection)
  },
  createDb: function() {
    var finished = true;
    return ; // Boolean(finished)
  },
  sample: function( connParams, amount ) {
    return ; // Object(sampleTweets)
  },
  analyze: function( connParams, amount ) {
    return ; // Object(histograms)
  }
};

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
