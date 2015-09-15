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

var sitesUrl = "http://www.craigslist.org/about/sites";
var userAgent = 'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.41 Safari/535.1';
var writePath = '/Users/homestead/Dropbox/Code/talos/server/json/siteMap.json';

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
    var regionMap = this.evaluate(function () {
      var map = {};
      var regions = [].slice.call(document.querySelectorAll('h1'));
      var regionData = document.querySelectorAll('.colmask');
      regions.forEach(function (region, i) {
        var regionName = region.innerText;
        var obj = map[regionName] = {};
        var currentRegionData = regionData[i];
        var stateHeaders = [].slice.call(currentRegionData.getElementsByTagName('h4'));
        var stateData = currentRegionData.getElementsByTagName('ul');
        stateHeaders.forEach(function (stateHeader, i) {
          var h = stateHeader.innerText;
          var innerObj = obj[h] = {};
          var currentListOfSites = [].slice.call(stateData[i].getElementsByTagName('a'));
          currentListOfSites.forEach(function (site) {
            var siteName = site.innerText.replace(/\/|\(|\)|\./g, '').split(' ').filter(function (r) {
              return r.length > 0;
            }).map(function (r) {
              return r[0].toUpperCase() + r.slice(1);
            }).join(' ').split('-').join(' ');
            var siteAddress = site.getAttribute('href').split('//')[1].split('.')[0];
            innerObj[siteName] = siteAddress;
          });
        });
      });
      return map;
    });
    this.emit('scrape complete', regionMap);
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

spooky.on('scrape complete', function (regionMap) {
  console.log('scrape complete');
  _fs2['default'].writeFile(writePath, JSON.stringify(regionMap), function (err, data) {
    console.log('~~~SUCCESSFULLY WRITTEN~~~ ');
  });
});

spooky.on('remote.message', function (msg) {
  console.log('remote message caught: ' + msg);
});

spooky.on('page.error', function (msg, trace) {
  console.log('Error: ' + msg);
});