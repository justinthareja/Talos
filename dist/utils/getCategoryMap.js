'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('babel/polyfill');

var _spooky = require('spooky');

var _spooky2 = _interopRequireDefault(_spooky);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var write = _bluebird2['default'].promisify(_fs2['default'].writeFile);
var read = _bluebird2['default'].promisify(_fs2['default'].read);

var sitesUrl = "http://sfbay.craigslist.org/";
var userAgent = 'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.41 Safari/535.1';
var writePath = '/Users/homestead/Dropbox/Code/talos/server/json/categoryMap.json';

var spooky = new _spooky2['default']({
  casper: {
    logLevel: 'debug',
    verbose: true
  }
}, function (err) {
  if (err) {
    e = new Error('Failed to initialize SpookyJS');
    e.details = err;
    throw e;
  }
  spooky.start(sitesUrl);
  spooky.userAgent(userAgent);
  spooky.then(function () {
    var categories = this.evaluate(function () {

      var results = {};
      var headers = [].slice.call(document.querySelectorAll('.ban a'));

      headers.forEach(function (header) {
        var isForum = header.getAttribute('href').split('/').length !== 3;
        var subcategories = [].slice.call(header.parentElement.nextElementSibling.querySelectorAll('a'));
        var headerName = header.querySelector('.txt').innerText;
        var headerPath = header.getAttribute('href');

        // skip the discussion forums and resume categories
        if (isForum) {
          return;
        }

        if (headerName === 'resumes') {
          return;
        }

        var category = results[headerName] = {};
        category['path'] = headerPath;
        category['subcategories'] = subcategories.reduce(function (memo, subcategory) {
          var subName = subcategory.querySelector('.txt').innerText
          // some string normalizing
          .replace(/\+/g, ' and ').split('/').map(function (el) {
            return el.trim();
          }).join('-').replace(/\[|\]/g, '').trim();

          var subPath = subcategory.getAttribute('class');
          var subPaths = subPath.split(' ');
          if (subPaths.length > 1) {
            subPath = subPaths[0];
          }

          memo[subName] = '/search/' + subPath;
          return memo;
        }, {});
      });
      return results;
    });
    this.emit('scrape complete', categories);
  });
  spooky.run();
});

/******NODE LISTENERS******/
spooky.on('navigation.requested', function (url, navigationType, navigationLocked, isMainFrame) {
  console.log('––––––––––Navigation Requested–––––––––', 'navtype', navigationType);
});

spooky.on('error', function (e, stack) {
  console.error(e);
  if (stack) {
    console.log(stack);
  }
});

spooky.on('console', function (line) {
  console.log(line);
});

spooky.on('log', function (log) {
  if (log.space === 'remote') {
    console.log(log.message.replace(/ \- .*/, ''));
  }
});

spooky.on('scrape complete', function (categoryMap) {
  console.log('scrape complete');
  _fs2['default'].writeFile(writePath, JSON.stringify(categoryMap, null, 2), function (err, data) {
    console.log('~~~SUCCESSFULLY WRITTEN~~~ ');
  });
});

spooky.on('remote.message', function (msg) {
  console.log('remote message caught: ' + msg);
});

spooky.on('page.error', function (msg, trace) {
  console.log('Error: ' + msg);
});