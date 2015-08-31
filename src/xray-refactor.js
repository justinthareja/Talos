import 'babel/polyfill';
import xray from 'x-ray';
import _ from 'lodash';

let x = xray();

//Parameters 
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
  return post; 
}

/* CLEANING FUNCTIONS */
function validateName(str) {
  return /^[A-z ]+$/.test(str) ? str : null;
}

function removeParens(str) {
  return str.replace(/[()]/g, '');
}

function cleanNumber(str) {
  return str.split(':')[1];
}


function asyncSearch(searchUrl) {
  return search( searchUrl )
    .then( results => {
      it.next( results )
    } )
    .catch( err => {
      console.log( err );
    } );
}

function asyncGetPost(postUrl) {
  return getPost( postUrl )
    .then( post => {
      it.next( post );
    } );
}

// generator function controls the flow of all async logic in sync looking syntax
// NOTE: for current state of babel generator functions need to be established using function expressions
let imFeelingLucky = function*(searchUrl) {
  let searchResults = yield asyncSearch( searchUrl );
  let firstPostUrl = searchResults[0].postUrl;
  let post = yield asyncGetPost( firstPostUrl );
  console.log( post )
}

let it = imFeelingLucky('http://sfbay.craigslist.org/search/sss?sort=rel&query=water%20fun');
it.next();

