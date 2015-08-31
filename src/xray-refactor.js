import 'babel/polyfill';
import xray from 'x-ray';
import _ from 'lodash';

let x = xray();

// Parameters
const host = 'http://sfbay.craigslist.org';
const searchUrl = host + '/search/rrr?sort=rel&query=something';
const postUrl = host + '/sby/for/5182969996.html';
const searchScope = '.row';
const nextSearchPage = '.button.next@href';
const searchProps = {
  postUrl: '.hdrlnk@href',
  title: '.hdrlnk',
  price: '.l2 > .price',
  lastUpdated: 'time@title',
  location: '.pnr small'
};
const postProps = {
  body: '#postingbody', 
  title: 'title',
  images: ['#thumbs a@href'],
  location: {
    region: '.postingtitletext small',
    lat: '#map@data-latitude',
    lon: '#map@data-longitude'
  },
  price: '.price',
  contact: x('#replylink@href', {
    name: '.reply_options ul > li', 
    phone:'.replytellink@href',
    email: '.anonemail'
  })
}

function log(stuff) {
  console.log(stuff)
  return stuff;
}

// Paginated search tool
function search(searchUrl, pages = 1) {
  return new Promise((resolve, reject) => {
    x(searchUrl, searchScope, [searchProps])
      .paginate(nextSearchPage)
      .limit(pages)((err, results) => {
        if (err) reject(err);
        resolve(results);
      });
  });
}

// Get post details from a valid craigslist post url
// TODO: add error handling for urls that have been taken down
function getPost(postUrl) {
  return new Promise((resolve, reject) => {
    x(postUrl, postProps)((err, post) => {
      if (err) reject(err);
      resolve(post);
    });
  });
}

function cleanPost(post) {
  post.body.trim(); 
  post.contact.name = validateName(post.contact.name);
  post.location.region = removeParens(post.location.region).trim(); 
  post.contact.phone = cleanNumber(post.contact.phone);
  console.log(post);
    
  return post; 
}

/* CLEANING FUNCTIONS */
function validateName(str) {
  console.log('validateName invoked with', str)
  return /^[A-z ]+$/.test(str) ? str : null;
}

function removeParens(str) {
  console.log('removeParens invoked with', str)
  return str.replace(/[()]/g, '');
}

function cleanNumber(str) {
  console.log('clean number invoked with str');
  return str ? str.split(':')[1] : null
}


// generator function controls the flow of all async logic by using appropriate async functions
// NOTE: for current state of babel generator functions need to be established using function expressions
// grabs the first post details from a search result 
// question: what's the best way to handle the final result?? a callback?
let imFeelingLucky = function*(searchUrl) {
  let searchResults = yield search( searchUrl );
  let firstPostUrl = searchResults[0].postUrl;
  let post = yield getPost( firstPostUrl );
  return cleanPost( post );
}

// wrapper function to run a generator function to completion
// TODO: implement error handling
function runGenerator(g, cb) {
    let it = g(), ret;
    // asynchronously iterate over generator
    (function iterate(val){
        ret = it.next( val );
        if (!ret.done) {
            // poor man's "is it a promise?" test
            if ("then" in ret.value) {
                // wait on the promise
                ret.value.then( iterate );
            // immediate value: just send right back in
            } else {
                // avoid synchronous recursion
                setTimeout( function(){
                    iterate( ret.value );
                }, 0 );
            }
        // when finished invoke the callback with generator's return value
        } else {
          cb( ret.value );
        }
    })();
    // return ret;
}

// kick off the imFeelingLucky chain of events
runGenerator(imFeelingLucky.bind(null, searchUrl), log);