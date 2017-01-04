function testFunction() {

    var Twit = require('twit')

    var T = new Twit({
        consumer_key:         '...',
        consumer_secret:      '...',
        access_token:         '...',
        access_token_secret:  '...',
        timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    });

    //
    // Twit has promise support; you can use the callback API,
    // promise API, or both at the same time.
    //
        T.get('account/verify_credentials', { skip_status: true })
            .catch(function (err) {
                console.log('caught error', err.stack)
            })
            .then(function (result) {
                // `result` is an Object with keys "data" and "resp".
                // `data` and `resp` are the same objects as the ones passed
                // to the callback.
                // See https://github.com/ttezel/twit#tgetpath-params-callback
                // for details.

                console.log('data', result.data);
            });


    return 1;
}

// If we're running under Node,
if (typeof exports !== 'undefined') {
    exports.testFunction = testFunction;
} else {
    console.log('not running under node?')
}