import 'babel/polyfill';  
import Spooky from 'spooky';
import _ from 'lodash';

const userAgent = 'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.41 Safari/535.1'

// Serialized helper functions
let helpers = {
  name: serialize(nameExists)
};

export function getPost(params) {
  let $scope = _.extend(params, helpers);

  return new Promise(function(resolve, reject) {  
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
        reject(e);
      }
      spooky.start(postUrl)
      spooky.userAgent(userAgent);
      // .then accepts a function twople: 
        // twople[0] = global variables from the node ctx to be passed into casper contex
        // twople[1] = function invoked during appropriate step in the .then chain
      spooky.then([$scope, checkPostExists]); // Ejects returning post = null
      spooky.then([$scope, getPostDetails]);
      spooky.then([$scope, checkCaptcha]); // Ejects with no contact = null
      spooky.then([$scope, getContactDetails]);
      spooky.then([$scope, returnPost]);
      spooky.run();
    });  

    /******NODE LISTENERS******/
    spooky.on('navigation.requested', function(url, navigationType, navigationLocked, isMainFrame){
      console.log('––––––––––Navigation Requested–––––––––', navigationType);
    });

    spooky.on('error', (e, stack) => {
      reject({
        err: e,
        stack: stack
      });
    });

    spooky.on('page.error', (e, stack) => {
      reject({
        err: e,
        stack: stack
      });
    }); 

    spooky.on('console', line => {
      console.log(line);
    });

    spooky.on('log', log => {
      if (log.space === 'remote') {
        console.log(log.message.replace(/ \- .*/, ''));
      }
    });
    
    spooky.on('remote.message', msg => {
      console.log('remote message caught: ' + msg);
    });

    spooky.on('got post', post => {
      // This is where the post object will live in the node context
      resolve(post)
    });
  });
}

/******CASPER FUNCTIONS******/
function getPostDetails() {
  // TODO: FILTER DUPLICATES
  // Create the post object accumulator as a casper global
  let post = window.post = {};

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

  // Grab link and open contact info page. Host is injected on $scope
  let replyInfo = host + this.getElementAttribute('#replylink', 'href');
  this.open(replyInfo)
}

function getContactDetails() {
  // Still has access to window.post defined in previous step
  let contact = window.post.contact = {};
  // Re-build helper function once in Casper context 
  let nameExists = new Function(name.body).bind(this);
  
  contact.name = nameExists() ? this.getElementInfo('.reply_options li').text : null;
  contact.email = this.fetchText('.anonemail');
  contact.phone = this.getElementAttribute('.replytellink', 'href');
}

function returnPost() {
  this.emit('got post', window.post);
}

function checkCaptcha() {
  if(this.exists('form#standalone_captcha')) {
    window.post.contact = null;
    this.log('CAPTCHA ALERT: Error receiving post contact info', 'error');
    this.bypass(1);
  } else {
    this.log('No CAPTCHA found, getting contact details...', 'info');
  }
}

function checkPostExists() {
  if(this.status(false).currentHTTPStatus === 404) {
    window.post = null;
    throw new Error('Invalid post url');
    this.bypass(3);
  }
  if (this.exists('#has_been_removed')) {
    window.post = null;
    throw new Error('Post has been removed');
    this.bypass(3);
  }
}

function nameExists() {
  return this.fetchText('.reply_options > b:first-child') === 'contact name:';
}

// Need to serialize functions before passing them into casper
function serialize(fn) {
  return {
    arguments: arguments,
    body: fn.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1]
  }
}

