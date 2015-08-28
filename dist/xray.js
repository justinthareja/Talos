'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _xRay = require('x-ray');

var _xRay2 = _interopRequireDefault(_xRay);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var x = (0, _xRay2['default'])();
var url = 'http://sfbay.craigslist.org/search/sss?query=car&sort=rel';

// get an array of all links
// x(url, ['.hdrlnk@href'])(log);

// get an array of all titles
// x(url, ['.hdrlnk'])(log);

// get an array of all price tags
// x(url, ['.l2 > .price'])(debug);

// get an array of all timestamps
// x(url, ['time@title'])(log);

function log(err, content) {
  if (err) {
    console.log(err);
  }
  console.log(content);
}

function debug(err, content) {
  debugger;
}

var properties = ['url', 'title', 'pricetag', 'timestamp'];

// selectors correspond to properties by index
var selectors = [['.hdrlnk@href'], ['.hdrlnk'], ['.l2 > .price'], ['time@title']];

/* convert array 

[
  'http:craigslist',
  'Super sports car',
  30, 
  '5:00am'
]

into 

{
 url: 'http:craigslist',
 title: 'Super sports car',
 pricetag: 30, 
 timestamp: '5:00am' 
}

*/
function addPropertyLabels(posts) {
  return posts.map(function (post) {
    return _lodash2['default'].zipObject(properties, post);
  });
}

function zip(searchResults) {
  return _lodash2['default'].zip.apply(_lodash2['default'], _toConsumableArray(searchResults));
}

// a function that takes a craigslist searchUrl and returns the properties
function getSearchResults(searchUrl) {
  return Promise.all(selectors.map(function (selector) {
    return scrape(searchUrl, selector);
  }));
}

function handleError(err) {
  console.log(err);
}

// promisify x-ray
function scrape(url, query) {
  return new Promise(function (resolve, reject) {
    x(url, query)(function (err, content) {
      if (err) reject(err);
      resolve(content);
    });
  });
}

// write a generateUrl function that takes an obj of params and turns it into a craigslist url

function search(url) {
  return getSearchResults(url).then(zip).then(addPropertyLabels)
  // .then(debug)
  ['catch'](handleError);
}

search(url);
// .then(debug);