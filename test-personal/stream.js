/**
 * Created by David on 26. 7. 2016.
 */

// funguje
var Twit = require('twit')
require('mongodb')

var T = new Twit({
  consumer_key: 'ieEKT1apDrIcnjlt8wR4yOqFf',
  consumer_secret: 'ADIObvcQvp8x01jaMFX4iD5oCW9VB5noY9NW6jS558BMhY6n0t',
  access_token: '120722111-AXtwB0S08MjOJbYJ19sQHxMbLqaFihARLAr0V7hg',
  access_token_secret: 'atThRDUy5ARU6VgvuO8a7YsqkKWhF1T4MmuH1WYh28QYK',
  timeout_ms: 60 * 1000  // optional HTTP request timeout to apply to all requests.
})

var stream = T.stream('statuses/sample')

stream.on('tweet', function (tweet) {
  var date = new Date().toISOString()
    // console.log(date, tweet.lang, tweet.user.lang, tweet.text);

  console.log(tweet.user.id_str)
})
