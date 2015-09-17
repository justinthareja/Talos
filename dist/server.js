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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var app = (0, _express2['default'])();

exports.app = app;
var readFile = _bluebird2['default'].promisify(_fs2['default'].readFile);
var port = 1337;

app.use(_bodyParser2['default'].json());
app.post('/api/search', verifySearchParams, sendSearchResults);
app.post('/api/post', sendPost);
app.listen(port);

function verifySearchParams(req, res, next) {
  if (!req.body.zone) res.status(400).send('No zone found');
  if (!req.body.territory) res.status(400).send('No territory found');
  if (!req.body.site) res.status(400).send('No site found');
  if (!req.body.category) res.status(400).send('No category found');
  if (!req.body.query) res.status(400).send('No query found');
  // TODO: verify category and site from siteMap and categoryMap
  next();
}

function sendSearchResults(req, res, next) {
  (0, _utilsQueryBuilderJs.getSearchParams)(req.body).then(_utilsSearchJs.search).then(function (results) {
    res.json(results);
  })['catch'](function (err) {
    res.status(500).send(err);
  });
};

function sendPost(req, res, next) {
  var options = (0, _utilsQueryBuilderJs.getPostParams)(req.body);
  (0, _utilsGetPostJs.getPost)(options).then(function (results) {
    res.json(results);
  })['catch'](function (err) {
    res.status(500).send(err);
  });
}

console.log('Launch party on port:', port);