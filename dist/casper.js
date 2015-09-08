'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _casper = require('casper');

var _casper2 = _interopRequireDefault(_casper);

require('utils');

var casper = _casper2['default'].create();
var host = 'http://sfbay.craigslist.org';
var postUrl = host + '/eby/ptd/5193255715.html';
var post = {};

casper.start(postUrl, getPostDetails).then(getContactDetails);

casper.on('open', function (location) {
  console.log('casper navigated to', location);
});
casper.run();

function getPostDetails() {

  var replylink = host + this.getElementAttribute('#replylink', 'href');
  var location = post.location = {};

  post.body = this.fetchText('#postingbody').map(function (body) {
    return body.trim();
  });
  post.images = this.getElementsAttribute('#thumbs a', 'href');
  post.title = this.fetchText('title');
  post.url = this.getCurrentUrl();
  post.price = this.fetchText('.price');

  location.region = this.fetchText('.postingtitletext small');
  location.lat = this.getElementAttribute('#map', 'data-latitude');
  location.long = this.getElementAttribute('#map', 'data-longitude');

  this.open(replylink);
}

function getContactDetails() {
  var contact = post.contact = {};

  contact.email = this.fetchText('.anonemail');

  if (this.fetchText('.reply_options > b:first-child') === 'contact name:') {
    contact.name = this.getElementInfo('.reply_options li').text;
  } else {
    contact.name = null;
  }

  if (this.exists('.replytellink')) {
    contact.phone = this.getElementAttribute('.replytellink', 'href');
  } else {
    contact.phone = null;
  }
  console.log(JSON.stringify(post, null, 2));
}