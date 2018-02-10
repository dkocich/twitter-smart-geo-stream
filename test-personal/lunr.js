const cities15000 = require('../geonames/cities15000.js').cities15000

var lunr = require('lunr')

var idx = lunr(function () {
  this.field('id', {boost: 10})
})

for (var i = 0; i < cities15000.length; i++) {
    // console.log(cities15000[i]);
  var doc = cities15000[i]
  idx.add(doc)
    // console.log(i).;
}

// console.log(cities15000[1]['id']);
idx.add(cities15000)

var searchRes = idx.search('London')
console.log(searchRes)
