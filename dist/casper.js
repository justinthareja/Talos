'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _casper = require('casper');

var _casper2 = _interopRequireDefault(_casper);

require('utils');

var c = _casper2['default'].create();

var host = 'http:';

c.start('http://sfbay.craigslist.org/eby/ptd/5193255715.html', function () {
  console.log(c.getElementAttribute('#replylink', 'href'));
});

// c.start('http://sfbay.craigslist.org/reply/sfo/hsh/5199980170', () => {
//   console.log('captcha form found:', c.exists('#standalone_captcha'))
//   console.log('posting body found:', c.exists('.posting'))

// })

c.run();