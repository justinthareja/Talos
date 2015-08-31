'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('babel/polyfill');

var _xRay = require('x-ray');

var _xRay2 = _interopRequireDefault(_xRay);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var x = (0, _xRay2['default'])();

// Parameters
var host = 'http://sfbay.craigslist.org';
var searchUrl = host + '/search/rrr?sort=rel&query=something';
var postUrl = host + '/sby/for/5182969996.html';
var searchScope = '.row';
var nextSearchPage = '.button.next@href';
var searchProps = {
  postUrl: '.hdrlnk@href',
  title: '.hdrlnk',
  price: '.l2 > .price',
  lastUpdated: 'time@title',
  location: '.pnr small'
};
var postProps = {
  body: '#postingbody',
  title: 'title',
  images: ['#thumbs a@href'],
  location: {
    region: '.postingtitletext small',
    lat: '#map@data-latitude',
    lon: '#map@data-longitude'
  },
  price: '.price',
  contact: x('#replylink@href', {
    name: '.reply_options ul > li',
    phone: '.replytellink@href',
    email: '.anonemail'
  })
};

function log(stuff) {
  console.log(stuff);
  return stuff;
}

// Paginated search tool
function search(searchUrl) {
  var pages = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  return new Promise(function (resolve, reject) {
    x(searchUrl, searchScope, [searchProps]).paginate(nextSearchPage).limit(pages)(function (err, results) {
      if (err) reject(err);
      resolve(results);
    });
  });
}

// Get post details from a valid craigslist post url
// TODO: add error handling for urls that have been taken down
function getPost(postUrl) {
  return new Promise(function (resolve, reject) {
    x(postUrl, postProps)(function (err, post) {
      if (err) reject(err);
      resolve(post);
    });
  });
}

function cleanPost(post) {
  post.body.trim();
  post.contact.name = validateName(post.contact.name);
  post.location.region = removeParens(post.location.region).trim();
  post.contact.phone = cleanNumber(post.contact.phone);
  console.log(post);

  return post;
}

/* CLEANING FUNCTIONS */
function validateName(str) {
  console.log('validateName invoked with', str);
  return (/^[A-z ]+$/.test(str) ? str : null
  );
}

function removeParens(str) {
  console.log('removeParens invoked with', str);
  return str.replace(/[()]/g, '');
}

function cleanNumber(str) {
  console.log('clean number invoked with str');
  return str ? str.split(':')[1] : null;
}

// generator function controls the flow of all async logic by using appropriate async functions
// NOTE: for current state of babel generator functions need to be established using function expressions
// grabs the first post details from a search result
// question: what's the best way to handle the final result?? a callback?
var imFeelingLucky = regeneratorRuntime.mark(function imFeelingLucky(searchUrl) {
  var searchResults, firstPostUrl, post;
  return regeneratorRuntime.wrap(function imFeelingLucky$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return search(searchUrl);

      case 2:
        searchResults = context$1$0.sent;
        firstPostUrl = searchResults[0].postUrl;
        context$1$0.next = 6;
        return getPost(firstPostUrl);

      case 6:
        post = context$1$0.sent;
        return context$1$0.abrupt('return', cleanPost(post));

      case 8:
      case 'end':
        return context$1$0.stop();
    }
  }, imFeelingLucky, this);
});

// wrapper function to run a generator function to completion
// TODO: implement error handling
function runGenerator(g, cb) {
  var it = g(),
      ret = undefined;
  // asynchronously iterate over generator
  (function iterate(val) {
    ret = it.next(val);
    if (!ret.done) {
      // poor man's "is it a promise?" test
      if ("then" in ret.value) {
        // wait on the promise
        ret.value.then(iterate);
        // immediate value: just send right back in
      } else {
          // avoid synchronous recursion
          setTimeout(function () {
            iterate(ret.value);
          }, 0);
        }
      // when finished invoke the callback with generator's return value
    } else {
        cb(ret.value);
      }
  })();
  // return ret;
}

// kick off the imFeelingLucky chain of events
runGenerator(imFeelingLucky.bind(null, searchUrl), log);