import c from 'casper';
import 'utils';

let casper = c.create();
let host = 'http://sfbay.craigslist.org';
let postUrl = host + '/eby/ptd/5193255715.html'
let post = {};

casper.start(postUrl, getPostDetails)
      .then(getContactDetails)

casper.on('open', function (location) {
  console.log('casper navigated to', location)
})
casper.run()

function getPostDetails() {

  let replylink = host + this.getElementAttribute('#replylink', 'href');
  let location = post.location = {};

  post.body = this.fetchText('#postingbody')
                  .map(body => body.trim());
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
  let contact = post.contact = {};

  contact.email = this.fetchText('.anonemail');

  if (this.fetchText('.reply_options > b:first-child') === 'contact name:') {
    contact.name = this.getElementInfo('.reply_options li').text
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
