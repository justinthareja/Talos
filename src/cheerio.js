import cheerio from 'cheerio';
import request from 'request-promise';
import _ from 'lodash';

/*
A better craigslist

acquire all the sites @ www.craigslist.org/about/sites. this gives the [prefix].craigslist.org
acquire all categories and subcategories: http://sfbay.craigslist.org/

http://auburn.craigslist.org/search/sss?srchType=T&hasPic=1&min_price=200&max_price=300&auto_make_model=honda+2009&min_auto_year=2002&max_auto_year=2009&min_auto_miles=01&max_auto_miles=1000&auto_drivetrain=1&auto_drivetrain=2&auto_drivetrain=3&auto_fuel_type=1&auto_fuel_type=2&auto_fuel_type=3&auto_fuel_type=4&auto_fuel_type=6&auto_paint=1&auto_paint=2&auto_paint=20&auto_paint=3&auto_paint=4&auto_paint=5&auto_paint=6&auto_paint=7&auto_paint=8&auto_paint=9&auto_paint=10&auto_paint=11&auto_size=1&auto_size=2&auto_size=3&auto_size=4&auto_title_status=1&auto_title_status=2&auto_title_status=3&auto_title_status=4&auto_title_status=5&auto_transmission=1&auto_transmission=2&auto_transmission=3&auto_bodytype=1&auto_bodytype=2&auto_bodytype=3&auto_bodytype=4&auto_bodytype=5&auto_bodytype=6&auto_bodytype=7&auto_bodytype=8&auto_bodytype=9&auto_bodytype=10&auto_bodytype=11&auto_bodytype=12&auto_bodytype=13&query=car

Query params:
  sort  (options:)
    rel: relevant
    date: newest
    priceasc: price lowest to highest
    pricedsc: price highest to lowest
query=“query string”

min_price: positive integer
max_price: positive integer
auto_make_model: string

CATEGORY: 
path right before ?
  { community: 'ccc',
    events: 'eee',
    forSale: 'sss',
    gigs: 'ggg',
    housing: 'hhh',
    jobs: 'jjj',
    personals: 'ppp',
    resumes: 'rrr',
    services: 'sss'
  }


search craigslist
acquire email address
auto generate and send email requesting free shit
  post mvp make templates
mail bot:
  request delivery service:
    create an automated message that expects a certain reply 
      lets say reply with a 'YES' if you are willing to deliver
        if they're willing to deliver, reply with an address and tell them to leave it on the curb. 
          (text 301-706-5917 for any details maybe?)
      reply with a 'NO' if you are not willing to deliver



mvp:
  copy search functionality
    the user enters a search query
    the site returns a list of 100 links
    the user can click each link to view the body of the post
next steps:
  the user can send an email to the original poster 
  options: filter duplicates, filter $1 
*/

let host = 'http://sfbay.craigslist.org';
function search(query) {
  let url = host + '/search/sss?query=' + query + '&sort=rel';
  return request(url)
    .then(getSearchResults)
    .then(detatchCheerioMetaData)
    .then(convertToArray)
    .then(siftTitles)
    .then(results => {
      // console.log(results)
    })
}

search('couch');

// need a function to get post data
// 


// sift takes a collection of objects and a property shared across all objects,
// and filters out all duplicate entries of the specified property
function sift(collection, property) {
  let filtered = _.reduce(collection, (memo, obj) => {
    let key = obj[property];
    if(!memo[key]) { 
      memo[key] = obj; 
    }
    return memo;
  }, {})
  return convertToArray(filtered);
}

function siftTitles(collection) {
  return sift(collection, 'title');
}

/******************************************************************************
  Search helper functions. The metaLink parameter refers to the html <p> tag 
  with class="row" on the search results page of craigslist. 
  Each helper function extracts a certain piece of search result
  meta data to be included in the search JSON object.
******************************************************************************/

function getUrl(metaLink) {
  return host + metaLink.firstChild.next.attribs.href;
}

function getTitle(metaLink) {
  return metaLink.children[3].children[3].children[3].firstChild.data;
}

function getTimePosted(metaLink) {
  return metaLink.children[3].children[3].children[1].attribs.title;
}

function getPrice(metaLink) {
  let priceTag = metaLink.children[3].children[5].children[1].firstChild.data;
  return priceTag.length > 1 ? parseInt(priceTag.split('$')[1]) : null;
}

// After querying a search url, getSearchResults will package one page of results into an object
// The body parameter refers to the html body of a craigslist search result page
// getSearchResults will return a cheerio object with numeric keys and values 
function getSearchResults(body) { 
  let $ = cheerio.load(body);
  return $('.row').map((i, post) => {
    return {
      title: getTitle(post),
      url: getUrl(post),
      price: getPrice(post),
      timestamp: getTimePosted(post)
    }
  });
}

// write a function that takes the html from a get request to a post and returns an object with post details:
// imageUrls
// post body
// contact info
let postURL = 'http://sfbay.craigslist.org/pen/cto/5193906043.html'

request(postURL)
  .then(getPostDetails)

function getPostBody($) {
  return $('#postingbody')[0].children
    .map(el => el.data)
    .filter(el => /\S/.test(el) && el !== undefined)
    .map(el => el.trim())
}

function getContactInfo($) {

}

function getPostDetails(body) {
  console.log('getPostDetails invoked')
  let $ = cheerio.load(body);
  // getBody
  var text = getPostBody($);
  // getContactInfo
    // getContactName
    // getContactPhone
    // getContactEmail
  

}

// Extracts an object's values into an array
function convertToArray(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

// Extract only the numeric keys from a cheerio obj
function detatchCheerioMetaData(cheerioObj) {
  var obj = cheerioObj;
  for (let k in obj) {
    if (isNaN(k)) {
      delete obj[k];
    }
  }
  return obj;
}


() => {

}()



