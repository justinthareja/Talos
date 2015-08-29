'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _xRay = require('x-ray');

var _xRay2 = _interopRequireDefault(_xRay);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var x = (0, _xRay2['default'])();

var host = 'http://sfbay.craigslist.org';
var searchUrl = host + '/search/rrr?sort=rel&query=something';
var postUrl = host + '/sby/tlg/5184362835.html';
var searchScope = '.row';
var nextSearchPage = '.button.next@href';
var props = {
  postUrl: '.hdrlnk@href',
  title: '.hdrlnk',
  price: '.l2 > .price',
  lastUpdated: 'time@title',
  location: '.pnr small'
};
var postProps = {
  contact: x('#replylink@href', {
    name: '.reply_options ul > li',
    phoneNumber: '.replytellink@href',
    email: '.anonemail'
  }),
  title: 'title'
};

function search(searchUrl) {
  var pages = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  return new Promise(function (resolve, reject) {
    x(searchUrl, searchScope, [props]).paginate(nextSearchPage).limit(pages)(function (err, results) {
      if (err) reject(err);
      resolve(results);
    });
  });
}

function getPost(postUrl) {
  return new Promise(function (resolve, reject) {
    x(postUrl, postProps)(function (err, post) {
      if (err) reject(err);
      resolve(post);
    });
  });
}

function log(stuff) {
  console.log(stuff);
  return stuff;
}

search(searchUrl).then(log).then(function (results) {
  console.log(results[0].postUrl);
  return getPost(results[0].postUrl);
}).then(log);

// function getReplyUrl(postUrl) {
//   var arr = postUrl.split('.html')[0].split('/');
//   arr.splice(3, 0, 'reply');
//   return arr.join('/');
// }
// rewrite in cleanup function
// function checkName (postUrl) {
//   return new Promise((resolve, reject) => {
//     x(getReplyUrl(postUrl), '.reply_options > b:first-child')((err, firstHeader) => {
//        if (err) reject(err)
//        resolve([postUrl, firstHeader === 'contact name:']);
//     });
//   }); 
// }
// console.log('reply url=', getReplyUrl(postUrl));
// x(getReplyUrl(postUrl), {
//   name: '.reply_options ul > li',
//   phoneNumber:'.replytellink@href',
//   email: '.anonemail'
// })((err, content) => {
//   if(err) console.log(err)
//   console.log(content)
// })

// console.log(getReplyUrl(postUrl))

// checkName('http://sfbay.craigslist.org/sfc/cto/5195375957.html')
//   .then(nameExists => {
//     console.log('this post has a contact name:', nameExists);
//   })
//   .catch(nope => {
//     console.log('nope', nope);
//   })