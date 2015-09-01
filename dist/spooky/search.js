'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _spooky = require('spooky');

var _spooky2 = _interopRequireDefault(_spooky);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var searchUrl = 'http://sfbay.craigslist.org/search/sss?query=acura+mdx';

// kick it off
search(searchUrl);

function search(searchUrl) {
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
    spooky.then(function () {
      var host = 'http://sfbay.craigslist.org';
      var results = {};
      results.timestamp = this.getElementsAttribute('time', 'title');
      results.postUrl = this.getElementsAttribute('.hdrlnk', 'href').map(function (path) {
        return host + path;
      });
      results.title = this.evaluate(function () {
        var nodes = document.querySelectorAll('.hdrlnk');
        return [].map.call(nodes, function (node) {
          return node.text;
        });
      });

      this.emit('search complete', results);
    });
    spooky.run();
  });
  /******NODE LISTENERS******/
  spooky.on('error', function (e, stack) {
    console.error(e);
    if (stack) {
      console.log(stack);
    }
  });

  spooky.on('hello', function (greeting) {
    console.log(greeting);
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
    console.log(zip(results));
  });
}

var results = {
  title: ['fat black dildo', 'game cube'],
  timestamp: ['8am', '1:00pm'],
  postUrl: ['http://word.com', 'http://chill.com']
};

function zip(resultsObj) {
  var len = Math.max.apply(null, _lodash2['default'].map(resultsObj, function (field) {
    return field.length;
  }));
  return _lodash2['default'].range(0, len - 1).reduce(function (results, i) {
    return results.concat(_lodash2['default'].reduce(resultsObj, function (memo, content, field) {
      memo[field] = content[i];
      return memo;
    }, {}));
  }, []);
}

/******CASPER FUNCTIONS******/