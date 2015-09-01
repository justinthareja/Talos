import Spooky from 'spooky';

let params = {
  host: 'http://sfbay.craigslist.org',
  path: '/sby/hsh/5200286628.html'
}

// Kick it off
getPost(params);

export function getPost ($scope) {
  let postUrl = $scope.host + $scope.path;
  let spooky = new Spooky({
    casper: {
      logLevel: 'debug',
      verbose: true
    }
  }, err => {
    if (err) {
      e = new Error('Failed to initialize SpookyJS');
      e.details = err;
      throw e;
    }
    spooky.start(postUrl)
    spooky.then([$scope, getPostDetails])
    spooky.then([$scope, getContactDetails])
    spooky.run();
  });  
  /******NODE LISTENERS******/
  spooky.on('error', (e, stack) => {
    console.error(e);
    if(stack) {
      console.log(stack);
    }
  });

  spooky.on('hello', greeting => {
    console.log(greeting)
  });

  spooky.on('console', line => {
    console.log(line);
  });

  spooky.on('log', log => {
    if (log.space === 'remote') {
      console.log(log.message.replace(/ \- .*/, ''));
    }
  });

  spooky.on('got post', post => {
    // this is where the post object will live
    console.log('post received in node', post);
  });
}

/******CASPER FUNCTIONS******/
function getPostDetails() {
  // Create the post object as a casper global 
  window.post = {};

  let location = window.post.location = {};
  let replylink = host + this.getElementAttribute('#replylink', 'href');

  window.post.body = this.fetchText('#postingbody');
  window.post.images = this.getElementsAttribute('#thumbs a', 'href');
  window.post.title = this.fetchText('title');
  window.post.url = this.getCurrentUrl();
  window.post.price = this.fetchText('.price');

  location.region = this.fetchText('.postingtitletext small');
  location.lat = this.getElementAttribute('#map', 'data-latitude');
  location.long = this.getElementAttribute('#map', 'data-longitude');

  this.open(replylink);
}

function getContactDetails() {
  let contact = window.post.contact = {};

  if (this.fetchText('.reply_options > b:first-child') === 'contact name:') {
    contact.name = this.getElementInfo('.reply_options li').text;
  }
  contact.email = this.fetchText('.anonemail');
  contact.phone = this.getElementAttribute('.replytellink', 'href');  

  this.emit('got post', window.post);
}





