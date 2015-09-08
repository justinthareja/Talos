'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('babel/polyfill');

var _spooky = require('spooky');

var _spooky2 = _interopRequireDefault(_spooky);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var params = {
  host: 'http://sfbay.craigslist.org',
  path: '/search/sss?query=acura+mdx',
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

function getResults() {
  var $$scope = arguments.length;
  console.log(JSON.stringify($$scope));
  var results = this.evaluate(function () {
    var $scope = arguments[0];
    // console.log(arguments);
    // console.log(JSON.stringify(params))
    // let host = 'http://sfbay.craigslist.org'
    // let rowNodes = document.querySelectorAll('.content .row');
    // let rowList = [].slice.call(rowNodes);
    // // let rowList = [...rowNodes];
    // return rowList.reduce(function(list, row) {
    //   let price = null;
    //   if(row.getElementsByClassName('price')[0]) {
    //     price = row.getElementsByClassName('price')[0].innerText
    //   }
    //   list.push({
    //       price: price,
    //       title: row.getElementsByClassName('hdrlnk')[0].innerText,
    //       postUrl: host + row.getElementsByClassName('hdrlnk')[0].getAttribute('href'),
    //       timestamp: row.getElementsByTagName('time')[0].getAttribute('title')
    //   });
    //   return list;
    // }, []);
  }, {
    host: host
  });

  this.emit('search complete', results);
}

/* or this
function zip(resultsObj) {
  let len = Math.max.apply(null, (_.map(resultsObj, field => field.length)));
  let results = [];

  for (var i = 0; i < len; i++) {
    let obj = {};
    for (field in resultsObj) {
      obj[field] = resultsObj[field];
    }
    results.push(obj);
  }

  return results;
}
*/
/******CASPER FUNCTIONS******/