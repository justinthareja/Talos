import 'babel/polyfill';
import Spooky from 'spooky';
import _ from 'lodash';

const params = {
  host: 'http://sfbay.craigslist.org',
  path: '/eby/hsh/5202228137.html',
  numSteps: 2
};

// Obj to serialize before passing in
let helpers = {
  name: parseBody(nameExists)
}

// getPost takes a params object with ->
  // host: 'http://sfbay.craigslist.org'
  // path: '/sby/hsh/5200286628.html'
function getPost ($scope) {
  const postUrl = $scope.host + $scope.path;
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
    // .then accepts a function twople:
      // twople[0] = global variables from the node ctx to be passed into casper contex
      // twople[1] = function invoked during appropriate step in the .then chain
    // Ejects without returning a post
    spooky.then([$scope, checkIfRemoved])
    spooky.then([$scope, getPostDetails]);
    // Ejects with no contact info found
    spooky.then([$scope, checkCaptcha]);
    spooky.then([$scope, getContactDetails]);
    spooky.run();
  });  

  /******NODE LISTENERS******/
  spooky.on('navigation.requested', function(url, navigationType, navigationLocked, isMainFrame){
    console.log('––––––––––Navigation Requested–––––––––', 'navtype', navigationType)
  })

  spooky.on('error', (e, stack) => {
    console.error(e);
    if(stack) {
      console.log(stack);
    }
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
    // This is where the post object will live
    // console.log('post received in node context', post);
  });

  spooky.on('remote.message', msg => {
    this.log('remote message caught: ' + msg, 'info');
    console.log('remote message caught: ' + msg);
  })

  spooky.on( 'page.error', (msg, trace) => {
    console.log('Error: ' + msg);
    this.log( 'Error: ' + msg, 'ERROR' );
  });
}

/******CASPER FUNCTIONS******/
function checkCaptcha() {
  if(this.exists('form#standalone_captcha')) {
    this.log('CAPTCHA SO HARD', 'error');
    this.log('Error receiving post contact info', 'error');
  } else {
    this.log('NO CAPTCHA FOUND...GETTING CONTACT DETAILS', 'info');
  }
}

function checkIfRemoved () {
  if (this.exists('#has_been_removed')) {
    this.log('POST REMOVED --- POPPING THE EJECT', 'info');
    this.bypass(numSteps);
  }
}

function nameExists () {
  return this.fetchText('.reply_options > b:first-child') === 'contact name:';
}

// Need to serialize functions before passing them into casper
function parseBody(fn) {
  return {
    arguments: arguments,
    body: fn.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1]
  }
}

function getPostDetails() {
  // TODO: FILTER DUPLICATES
  // Create the post object accumulator as a casper global
  window.post = {};

  // Add main page attributes (if they exist);
  window.post.body = this.fetchText('#postingbody');
  window.post.images = this.getElementsAttribute('#thumbs a', 'href');
  window.post.title = this.fetchText('title');
  window.post.url = this.getCurrentUrl();
  window.post.price = this.fetchText('.price');

  // Add location attributes (if they exist);
  let location = window.post.location = {};
  location.region = this.fetchText('.postingtitletext small');
  location.lat = this.getElementAttribute('#map', 'data-latitude');
  location.long = this.getElementAttribute('#map', 'data-longitude');

  // Grab link to contact info page. Host is injected on $scope
  let replyInfo = host + this.getElementAttribute('#replylink', 'href');
  this.log('replyInfo =', replyInfo);
  // replyInfo will be available in the next spooky.then invoked
  this.open(replyInfo);
}

function getContactDetails() {
  // Still has access to window.post defined in previous step
  let nameExists = new Function(name.body);
  let bound = nameExists.bind(this);
  let contact = window.post.contact = {};
  
  contact.name = this.getElementInfo('.reply_options li').text;
  contact.email = this.fetchText('.anonemail');
  contact.phone = this.getElementAttribute('.replytellink', 'href');
  console.log('name=', contact.name)
  this.emit('got post', window.post);
}

function sendResponse(responseCode, data) {
  // TODO
}


// Kick it off
getPost(_.extend(params, helpers));
