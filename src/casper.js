import casper from 'casper';
import 'utils';
let c = casper.create();



let host = 'http:'

c.start('http://sfbay.craigslist.org/eby/ptd/5193255715.html', () => {
  console.log(c.getElementAttribute('#replylink', 'href'))
})

// c.start('http://sfbay.craigslist.org/reply/sfo/hsh/5199980170', () => {
//   console.log('captcha form found:', c.exists('#standalone_captcha'))
//   console.log('posting body found:', c.exists('.posting'))

// })


c.run()
