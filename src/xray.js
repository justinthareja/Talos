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
  lastUpdated: 'time@title',
  location: '.pnr small',
  postUrl: '.hdrlnk@href',
  price: '.l2 > .price',
  title: '.hdrlnk'
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

// A map of dirty fields to their cleaning functions
const dirtyFields = {
  body: trim,
  contact: {
    name: validateName,
    phone: cleanNumber
  },
  location: {
    region: removeParens
  }
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
      console.log(post);
      if (err) reject(err);
      resolve(post);
    });
  });
}

function cleanPost(post, nest = []) {
  let map = dirtyFields;
  if(nest.length) {
    map = _.reduce(nest, function(memo, key) {
      return map[key];
    }, map);
  }
  _.forEach(post, function(content, field, post) {
    if (content instanceof Object && !Array.isArray(content)) {
      post = cleanPost(content, nest.concat(field));
    } else if (field in map) {
      post[field] = map[field](content);
    }
  });
  return post;
}


/* CLEANING FUNCTIONS */
function validateName(str) {
  return /^[A-z ]+$/.test(str) ? str : null;
}

function removeParens(str) {
  return str.replace(/[()]/g, '').trim();
}

function cleanNumber(str) {
  return str.split(':')[1];
}

function trim(str) {
  return str.trim();
}



// generator function controls the flow of all async logic by using appropriate async functions
// NOTE: for current state of babel generator functions need to be established using function expressions
// grabs the first post details from a search result 
// REMEMBER: yield async expressions
let imFeelingLucky = function*(searchUrl) {
  let searchResults = yield search( searchUrl );
  let firstPostUrl = searchResults[0].postUrl;
  let post = yield getPost( firstPostUrl );
  console.log(post)
  let cleaned = cleanPost( post );
  return cleaned;
}

// wrapper function to run a generator function which yields promises to completion
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
          if(cb) cb( ret.value );
        }
    })();
}

// kick off the imFeelingLucky chain of events
runGenerator(imFeelingLucky.bind(null, searchUrl), log);