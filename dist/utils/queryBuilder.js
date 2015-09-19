'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getPostParams = getPostParams;
exports.getSearchParams = getSearchParams;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _urlParse = require('url-parse');

var _urlParse2 = _interopRequireDefault(_urlParse);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var readFile = _bluebird2['default'].promisify(_fs2['default'].readFile);

// converts the req.body to the options object getPost needs

function getPostParams(post) {
  var url = new _urlParse2['default'](post.url);
  return {
    host: 'http://' + url.hostname,
    path: url.pathname
  };
}

// converts the req.body to the options object search needs

function getSearchParams(search) {
  return parseSite(search).then(parseBoard).then(function (params) {
    return {
      host: 'http://' + params.region + '.craigslist.org',
      path: params.board + '?' + 's=' + (params.page - 1) * 100 + '&' + 'query=' + params.query
    };
  });
}

function parseSite(search) {
  var siteMap = '/Users/homestead/Dropbox/Code/talos/server/maps/siteMap.json';
  return readFile(siteMap, 'utf-8').then(function (sites) {
    var map = JSON.parse(sites);
    var zone = search.zone;
    var territory = search.territory;
    var site = search.site;

    search.region = map[zone][territory][site];

    return search;
  });
}

function parseBoard(search) {
  var categoryMap = '/Users/homestead/Dropbox/Code/talos/server/maps/categoryMap.json';
  return readFile(categoryMap, 'utf-8').then(function (categories) {
    var map = JSON.parse(categories);
    var subcategory = search.subcategory;
    var category = search.category;

    if (subcategory === null) {
      search.board = map[category]['path'];
    } else {
      search.board = map[category]['subcategories'][subcategory];
    }

    return search;
  });
}