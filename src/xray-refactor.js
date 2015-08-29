import xray from 'x-ray';
import _ from 'lodash';

let x = xray();

const host = 'http://sfbay.craigslist.org';
const searchUrl = host + '/search/rrr?sort=rel&query=something';
const postUrl = host + '/sby/tlg/5184362835.html'
const searchScope = '.row';
const nextSearchPage = '.button.next@href';
const props = {
  postUrl: '.hdrlnk@href',
  title: '.hdrlnk',
  price: '.l2 > .price',
  lastUpdated: 'time@title',
  location: '.pnr small'
};
const postProps = {
  contact: x('#replylink@href', {
    name: '.reply_options ul > li',
    phoneNumber:'.replytellink@href',
    email: '.anonemail'
  }),
  title: 'title',
}

function search(searchUrl, pages = 1) {
  return new Promise((resolve, reject) => {
    x(searchUrl, searchScope, [props])
      .paginate(nextSearchPage)
      .limit(pages)((err, results) => {
        if (err) reject(err);
        resolve(results);
      });
  });
}


function getPost (postUrl) {
  return new Promise((resolve, reject) => {
    x(postUrl, postProps)((err, post) => {
      if (err) reject(err);
      resolve(post);
    });
  });
}

function log(stuff) {
  console.log(stuff)
  return stuff;
}

search(searchUrl)
  .then(log)
  .then(results => {
    console.log(results[0].postUrl);
    return getPost(results[0].postUrl)
  })
  .then(log)

// function getReplyUrl(postUrl) {
//   var arr = postUrl.split('.html')[0].split('/');
//   arr.splice(3, 0, 'reply');
//   return arr.join('/');
// }
// rewrite in cleanup function
// function checkName (postUrl) {
//   return new Promise((resolve, reject) => {
//     x(getReplyUrl(postUrl), '.reply_options > b:first-child')((err, firstHeader) => {
//        if (err) reject(err)
//        resolve([postUrl, firstHeader === 'contact name:']); 
//     });
//   });  
// }
// console.log('reply url=', getReplyUrl(postUrl));
// x(getReplyUrl(postUrl), {
//   name: '.reply_options ul > li',
//   phoneNumber:'.replytellink@href',
//   email: '.anonemail' 
// })((err, content) => {
//   if(err) console.log(err)
//   console.log(content)
// })

// console.log(getReplyUrl(postUrl))

// checkName('http://sfbay.craigslist.org/sfc/cto/5195375957.html')
//   .then(nameExists => {
//     console.log('this post has a contact name:', nameExists);
//   })
//   .catch(nope => {
//     console.log('nope', nope);
//   })



