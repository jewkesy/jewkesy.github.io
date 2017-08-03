'use strict';
var https = require('https');

var MONGO_URI = process.env.mongoURI;
var MONGO_API = process.env.mongoAPIKey;
var PC_LEAGUE = process.env.popcornLeague;
var PC_STATS = process.env.popcornStats;
var PC_COUNT = process.env.popcornCount;
var TF_LEAGUE = process.env.trifleLeague;
var TF_COUNT = process.env.trifleCount;

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 */
exports.handler = (event, context, callback) => {
    // console.log('Received event:', JSON.stringify(event, null, 2));

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
    });

    switch (event.httpMethod) {
        case 'GET':
            getContent(event.queryStringParameters, done);
            break;
        case 'DELETE':
        case 'POST':
        case 'PUT':
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};

function getContent(qs, callback) {
    var limit = 10;
    if (qs && qs.limit) limit = qs.limit;
    
    var url = MONGO_URI;
    
    switch (qs.action) {
        case 'getscores':
            if (qs.prefix == 'pc') url += PC_LEAGUE;
            else if (qs.prefix == 'tf') url += TF_LEAGUE;
            break;
        case 'getstats':
            if (qs.prefix == 'pc') url += PC_STATS;
            break;
        case 'getcounts':
            if (qs.prefix == 'pc') url += PC_COUNT;
            else if (qs.prefix == 'tf') url += TF_COUNT;
            break;
        default:
            return callback(new Error(`Unsupported action "${qs.action}"`));
    }
    
    url += "&apiKey=" + MONGO_API;
    // console.log(url)
    
    https.get(url, (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];
    
      let error;
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          `Expected application/json but received ${contentType}`);
      }
      if (error) {
        console.error(error.message);
        res.resume();
        return callback(error); // consume response data to free up memory
      }
    
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
        //   console.log(parsedData);
          return callback(null, parsedData);
        } catch (e) {
          console.error(e.message);
          return callback(e);
        }
      });
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
      return callback(e);
    });
}
