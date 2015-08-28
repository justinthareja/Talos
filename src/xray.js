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

function handleError (err) {
  console.log(err);
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
  'http://craigslist.org',
  'Super sports car',
  3000, 
  '5:00am on a Thursday'
]

into 

{
 url: 'http:craigslist',
 title: 'Super sports car',
 pricetag: 30, 
 timestamp: '5:00am' 
}

*/

// returns an array of post objects with proper keys corresponding to each prop
function addPropertyLabels (posts) {
  return posts.map(post => _.zipObject(properties, post));
}

// zips search results into an array of post arrays
// each post array contains all properties in the properties array
function zip(searchResults) {
  return _.zip(...searchResults);
}

// takes a craigslist searchUrl and returns an array of unlinked search results
function getSearchResults(searchUrl) {
  return Promise.all(selectors.map(selector => scrape(searchUrl, selector)));
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

// TODO: write a generateUrl function that takes an obj of params and turns it into a craigslist url
 
function search(url) {
  return getSearchResults(url)
    .then(zip)
    .then(addPropertyLabels)
    // .then(debug)
    .catch(handleError)
}

search(url)
  // .then(debug);

