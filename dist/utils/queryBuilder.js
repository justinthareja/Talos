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
var siteMap = '/Users/homestead/Dropbox/Code/talos/server/json/siteMap.json';

function getPostParams(post) {
  var url = new _urlParse2['default'](post.url);
  return {
    host: 'http://' + url.hostname,
    path: url.pathname
  };
}

function getSearchParams(search) {
  return readFile(siteMap, 'utf-8').then(function (data) {
    var map = JSON.parse(data);
    var zone = search.zone;
    var territory = search.territory;
    var site = search.site;
    var region = map[zone][territory][site];

    return {
      host: 'http://' + region + '.craigslist.org',
      path: '/search/' + search.category + '?query=' + search.query
    };
  });
}