import xray from 'x-ray';
import _ from 'lodash';

let x = xray();
let url = 'http://sfbay.craigslist.org/search/sss?query=car&sort=rel';

// get an array of all links
// x(url, ['.hdrlnk@href'])(log);

// get an array of all titles
// x(url, ['.hdrlnk'])(log);

// get an array of all price tags
// x(url, ['.l2 > .price'])(debug);

// get an array of all timestamps
// x(url, ['time@title'])(log);


function log(err, content) {
  if(err) {
    console.log(err)
  }
  console.log(content);
}

function debug(err, content) {
  debugger;
}


const properties = [
  'url',
  'title',
  'pricetag',
  'timestamp'
];

// selectors correspond to properties by index
const selectors = [
  ['.hdrlnk@href'],
  ['.hdrlnk'],
  ['.l2 > .price'],
  ['time@title'],
];

/* convert array 

[
  'http:craigslist',
  'Super sports car',
  30, 
  '5:00am'
]

into 

{
 url: 'http:craigslist',
 title: 'Super sports car',
 pricetag: 30, 
 timestamp: '5:00am' 
}

*/
function addPropertyLabels (posts) {
  return posts.map(post => _.zipObject(properties, post));
}

function zip(searchResults) {
  return _.zip(...searchResults);
}

// a function that takes a craigslist searchUrl and returns the properties 
function getSearchResults(searchUrl) {
  return Promise.all(selectors.map(selector => scrape(searchUrl, selector)));
}

function handleError (err) {
  console.log(err);
}

// promisify x-ray
function scrape(url, query) {
  return new Promise(function(resolve, reject) {
    x(url, query)(function(err, content) {
      if (err) reject(err)
      resolve(content)
    });
  });
}

// write a generateUrl function that takes an obj of params and turns it into a craigslist url

 
function search(url) {
  return getSearchResults(url)
    .then(zip)
    .then(addPropertyLabels)
    // .then(debug)
    .catch(handleError)
}

search(url)
  // .then(debug);

