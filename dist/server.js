'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _utilsSearchJs = require('./utils/search.js');

var _utilsGetPostJs = require('./utils/getPost.js');

var _utilsQueryBuilderJs = require('./utils/queryBuilder.js');

var app = (0, _express2['default'])();
exports.app = app;
var port = 1337;

app.use(_bodyParser2['default'].json());
app.post('/api/search', sendResults);
app.post('/api/post', sendPost);
app.listen(port);

app.param('region', function (req, res, next, region) {
  // search the region map --> a map that takes good regions and turns them into craigslist regions
  // if the region exists in the map
  // set the region to req.body
  // invoke next()
  // else call next with an err
});

app.param('category', function (req, res, next, category) {
  // search the region map --> a map that takes good regions and turns them into craigslist regions
  // if the region exists in the map
  // set the region to req.body
  // invoke next()
  // else call next with an err
});

function sendResults(req, res, next) {
  var options = (0, _utilsQueryBuilderJs.getSearchParams)(req.body);
  (0, _utilsSearchJs.search)(options).then(function (results) {
    res.json(results);
  });
};

function sendPost(req, res, next) {
  var options = (0, _utilsQueryBuilderJs.getPostParams)(req.body);
  (0, _utilsGetPostJs.getPost)(options).then(function (results) {
    res.json(results);
  });
}

console.log('Launch party on port:', port);