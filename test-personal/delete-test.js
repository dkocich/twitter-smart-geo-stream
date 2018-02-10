var tweet = {
    // id: "iddddd",
    // a: "aa",
    // b: "bb",
    // c: "cc",
  coordinates: 'aaa'
}

// delete tweet.
console.log(tweet)

const mediumKeyFilter = ['id_str', 'user.id_str', 'created_at', 'coordinates', 'place', 'entities']
const smallKeyFilter = ['id_str', 'user.id_str', 'created_at', 'coordinates']

// Object.keys(obj).forEach(function (key) {
//     // do something with obj[key]
//     console.log('a');
// });

// for (key in tweet) {
//     console.log('a');
// }
//
var p = new Object()
p.tweetSaveSize = 'medium'

console.log(tweet)
console.log(saveTweet)
