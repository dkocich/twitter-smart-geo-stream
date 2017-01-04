'use strict';

var should = require('should');

var myCode = require('./functions');

describe('tests', function(){
    describe('testFunction', function(){
        it('should return 1', function(){
            // Call the exported function from the module
            myCode.testFunction().should.equal(1);
        })
    })
});

console.log("... NO TESTS CURRENTLY ...")

// TODO WRITE SOME TESTS!!!