'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getPostParams = getPostParams;
exports.getSearchParams = getSearchParams;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _urlParse = require('url-parse');

var _urlParse2 = _interopRequireDefault(_urlParse);

function getPostParams(post) {
  var url = new _urlParse2['default'](post.url);
  return {
    host: 'http://' + url.hostname,
    path: url.pathname
  };
}

function getSearchParams(search) {
  return {
    host: 'http://' + search.region + '.craigslist.org',
    path: '/search/' + search.category + '?query=' + search.query
  };
}