'use strict';
var https = require('https');

var MONGO_URI = process.env.mongoURI || process.argv[2];
var MONGO_API = process.env.mongoAPIKey || process.argv[3];
var PC_LEAGUE = process.env.popcornLeague;
var PC_STATS = process.env.popcornStats;
var PC_COUNT = process.env.popcornCount;
var TF_LEAGUE = process.env.trifleLeague;
var TF_COUNT = process.env.trifleCount;
var REVIEWS = process.env.amazonReviews || process.argv[4];

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
      if (event.queryStringParameters.amazon) {
        getAmazon(done);
      } else if (event.queryStringParameters.last) {
        getLastGame(event.queryStringParameters, done);
      } else {
        getContent(event.queryStringParameters, done);
      }
      break;
    case 'DELETE':
    case 'POST':
    case 'PUT':
      break;
    default:
      done(new Error(`Unsupported method "${event.httpMethod}"`));
  }
};

function getAmazon(callback) {
  var url = MONGO_URI + REVIEWS + "&apiKey=" + MONGO_API;
  console.log(url);
  getData(url, function (e, msg) {
    if (e) return callback(e);
    var retVal = {
      reviews: msg
    }
    return callback(null, retVal);
  });
}

function getLastGame(qs, callback) {
  console.log(qs)

  var url = MONGO_URI;

  if (qs.prefix == 'pc') url += '/popcornquiz';
  else if (qs.prefix == 'tf') url += '/trifle';
  else return callback('unhandled prefix');

  url += '/collections/game?l=1&f={timestamp:1,"_id":0}&s={"timestamp":-1}'

  if (qs.prefix == 'pc' && qs.locale && qs.locale != '' && qs.locale != 'undefined') {
    url += '&q={"locale":"' + qs.locale + '"}';
  }

  url += "&apiKey=" + MONGO_API;

  // console.log(url) 
  getData(url, function (e, msg) {
    if (e) return callback(e);
    // console.log(e, msg);
    return callback(null, msg);
  });
}

function getContent(qs, callback) {
  console.log(qs)
  var limit = 10;
  if (qs && qs.limit) limit = qs.limit;

  var url = MONGO_URI;

  if (qs.prefix == 'pc') url += '/popcornquiz';
  else if (qs.prefix == 'tf') url += '/trifle';
  else return callback('unhandled prefix');

  url += '/collections/game?l=0&f={"score":1,"games":1,"timestamp":1,"startTimestamp":1,"locale":1,"icon":1,"_id":0}&s={"score":-1,"games":1,timestamp":1}'

  if (qs.prefix == 'pc' && qs.locale && qs.locale != '' && qs.locale != 'undefined') {
    url += '&q={"locale":"' + qs.locale + '"}';
  }

  url += "&apiKey=" + MONGO_API;

  // console.log(url) 
  getData(url, function (e, msg) {
    if (e) return callback(e);
    // console.log(e, msg);
    var league = [];
    var newUsers = [];
    var lastGame = {t:0};
    var totalGames = 0;
    for (var i = 0; i < msg.length; i++) {
      var item = msg[i];
      var x = {
        st: item.startTimestamp,
        s: item.score,
        g: item.games,
        t: item.timestamp,
        l: item.locale
      }

      if (item.icon) x.i = item.icon;

      totalGames += x.g;
      newUsers.push({
        l: x.l,
        d: x.st
      });
      if (x.t >lastGame.t) {
        lastGame = x;
        lastGame.r = i+1;
      }
      if (i < limit) league.push(x);
    }

    // console.log(league);
    // console.log(newUsers);
    // console.log(lastGame);

    var retVal = {
      league: league,
      newUsers: newUsers,
      lastGame: lastGame,
      totalUsers: msg.length,
      totalGames: totalGames
    }
    // console.log(league)
    return callback(null, retVal);
  });
}

function getData(url, callback) {
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
