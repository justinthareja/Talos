import xray from 'x-ray';
import _ from 'lodash';

let x = xray();
const url = 'http://sfbay.craigslist.org/search/sss?query=toys&sort=rel';
// const scope = '.row';
// const nextButton = '.button.next@href'
// const propsToSelectors = {
//   url: '.hdrlnk@href',
//   title: '.hdrlnk',
//   price: '.l2 > .price',
//   lastUpdated: 'time@title'
// }

const selectors = {
  scope: '.row',
  nextPage: '.button.next@href',
  props: {
    url: '.hdrlnk@href',
    title: '.hdrlnk',
    price: '.l2 > .price',
    lastUpdated: 'time@title'
  }
}
// get an array of all links
// x(url, ['.hdrlnk@href'])(log);

// get an array of all titles
// x(url, ['.hdrlnk'])(log);

// get an array of all price tags
// x(url, ['.l2 > .price'])(debug);

// get an array of all timestamps
// x(url, ['time@title'])(log);

// get a collection of objects with 
// props included in the third parameter
// that's way too easy!
// x(url, selectors.scope, [selectors.props])
// .paginate(selectors.nextPage)
// .limit(2)(log)






function log(err, content) {
  if(err) {
    console.log(err)
  }
  console.log('content.length =', content.length);
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
  'price',
  'lastUpdated'
];

// selectors correspond to properties by index
// const selectors = [
//   ['.hdrlnk@href'],
//   ['.hdrlnk'],
//   ['.l2 > .price'],
//   ['time@title'],
// ];

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
function scrape(url, scope, selector) {
  return new Promise(function(resolve, reject) {
    x(url, scope, selector)
    .paginate(selectors.nextPage)
    .limit(2)(function(err, content) {
      if (err) reject(err)
      resolve(content)
    });
  });
}

// TODO: write a generateUrl function that takes an obj of params and turns it into a craigslist url
 
// function search(url) {
//   return getSearchResults(url)
//     .then(zip)
//     .then(addPropertyLabels)
//     // .then(debug)
//     .catch(handleError)
// }

// search(url)
//   .then((url) => {
//     console.log(url)
//   });

// function search (url) {
//   return new Promise(function(resolve, reject) {
//     resolve(x(url, scope, propsToSelectorsMap)
//     .paginate('.button.next@href')
//     .limit(2))
//   })
// }

// se




