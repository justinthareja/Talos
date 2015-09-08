'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.search = search;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('babel/polyfill');

var _spooky = require('spooky');

var _spooky2 = _interopRequireDefault(_spooky);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var params = {
  host: 'http://sfbay.craigslist.org',
  path: '/search/sss?query=lexus',
  userAgent: 'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.41 Safari/535.1'
};

// kick it off
search(params);

function search($scope) {
  var searchUrl = $scope.host + $scope.path;
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
    spooky.start(searchUrl);
    spooky.userAgent($scope.userAgent);
    spooky.then([$scope, getResults]);
    spooky.run();
  });
  /******NODE LISTENERS******/
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

  spooky.on('search complete', function (results) {
    console.log('search complete here ya go:', results);
  });

  spooky.on('remote.message', function (msg) {
    console.log('remote message caught: ' + msg);
  });

  spooky.on('page.error', function (msg, trace) {
    console.log('ERROR: ' + msg);
  });
}

/******CASPER FUNCTIONS******/
function getResults() {
  var results = this.evaluate(function (host) {
    var rowNodes = document.querySelectorAll('.content .row');
    var rowList = [].slice.call(rowNodes);

    return rowList.reduce(function (list, row) {
      var post = {};

      post.title = row.getElementsByClassName('hdrlnk')[0].innerText;
      post.timestamp = row.getElementsByTagName('time')[0].getAttribute('title');
      post.postUrl = host + row.getElementsByClassName('hdrlnk')[0].getAttribute('href');
      post.price = null;

      if (row.getElementsByClassName('price')[0]) {
        post.price = row.getElementsByClassName('price')[0].innerText;
      }

      return list.concat(post);
    }, []);
  }, {
    host: host
  });

  this.emit('search complete', results);
}