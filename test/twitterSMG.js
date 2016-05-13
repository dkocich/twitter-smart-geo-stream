'use strict';

var should = require('chai').should(),
    expect = require('chai').expect,
    twitterSMG = require('../index'),
    // escape = scapegoat.escape,
    // unescape = scapegoat.unescape,
    initiate = twitterSMG.initiate;

describe('#initiate', function() {
    var p = {
      apikey: 'aaa'
    , apisecret: 'bbb'
    , sampleSize: 10
    };

    it('should check if object exists', function(parameters) {
        var result = initiate( p );
        expect(result).to.equal( p );
    });

    it('should check if attributes are strings', function(parameters) {
        var result = initiate( p );
        expect(result).to.equal( p );
    });

});

// describe('#escape', function() {
//   it('converts & into &amp;', function() {
//     escape('&').should.equal('&amp;');
//   });
//
//   it('converts " into &quot;', function() {
//     escape('"').should.equal('&quot;');
//   });
//
//   it('converts ' into &#39;', function() {
//     escape(''').should.equal('&#39;');
//   });
//
//   it('converts < into &lt;', function() {
//     escape('<').should.equal('&lt;');
//   });
//
//   it('converts > into &gt;', function() {
//     escape('>').should.equal('&gt;');
//   });
// });
//
// describe('#unescape', function() {
//   it('converts &amp; into &', function() {
//     unescape('&amp;').should.equal('&');
//   });
//
//   it('converts &quot; into "', function() {
//     unescape('&quot;').should.equal('"');
//   });
//
//   it('converts &#39; into '', function() {
//     unescape('&#39;').should.equal(''');
//   });
//
//   it('converts &lt; into <', function() {
//     unescape('&lt;').should.equal('<');
//   });
//
//   it('converts &gt; into >', function() {
//     unescape('&gt;').should.equal('>');
//   });
// });
