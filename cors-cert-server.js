const http = require('http');

// Listen on a specific host via the HOST environment variable
// var host = process.env.HOST || 'localhost';
// Listen on a specific port via the PORT environment variable
// var port = process.env.PORT || 8084;



// Read NMS Config file
let NMSConfig;
http.get("http://localhost/imagine/nms-config.js", (response) => {
  let data = '';

  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    data = data.split('=')[1]; // get the json content. The original data starts with "var NMSConfig = {"
    let rowsWithComments = data.split('\n');
    let rows = [];
    rowsWithComments.forEach(row => {
      row = row.trim(); // remove spaces before //
      row = row.replace(';', ''); // remove semicolon command ends
      if (!row.startsWith('//')) {
        rows.push(row);
      }
    });
    NMSConfig = JSON.parse(rows.join('\n'));
    console.log('Reading data from NMSConfig file of Imagine server:', NMSConfig);

    // let host = NMSConfig.networkID + NMSConfig.hostID;
    let port = NMSConfig.nmsProxyPort;

    init(port);

  });

}).on('error', (err) => {
  console.log('Error getting file:', err);
});




function init(port) {
  // Grab the blacklist from the command-line so that we can update the blacklist without deploying
  // again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
  // immediate abuse (e.g. denial of service). If you want to block all origins except for some,
  // use originWhitelist instead.
  var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
  var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
  function parseEnvList(env) {
    if (!env) {
      return [];
    }
    return env.split(',');
  }
  
  // Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
  var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);
  
  var cors_proxy = require('./lib/cors-anywhere');
  cors_proxy.createServer({
    originBlacklist: originBlacklist,
    originWhitelist: originWhitelist,
    requireHeader: [],
    checkRateLimit: checkRateLimit,
    removeHeaders: [
      'cookie',
      'cookie2',
      // Strip Heroku-specific headers
      // 'x-request-start',
      // 'x-request-id',
      // 'via',
      // 'connect-time',
      // 'total-route-time',
      // Other Heroku added debug headers
      // 'x-forwarded-for',
      // 'x-forwarded-proto',
      // 'x-forwarded-port',
    ],
    redirectSameOrigin: true,
    httpProxyOptions: {
      // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
      xfwd: false,
      secure: false, 
    },
  }).listen(port, function() {
    console.log('Running CORS Anywhere on port:' + port);
  });
}

