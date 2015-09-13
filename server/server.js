import express from 'express';
import bodyParser from 'body-parser';
import {search} from './utils/search.js';
import {getPost} from './utils/getPost.js'
import {getSearchParams, getPostParams} from './utils/queryBuilder.js';

export let app = express();
const port = 1337;

app.use(bodyParser.json());
app.post('/api/search', sendResults);
app.post('/api/post', sendPost);
app.listen(port);



app.param('region', function(req, res, next, region) {
  // search the region map --> a map that takes good regions and turns them into craigslist regions
  // if the region exists in the map
    // set the region to req.body
    // invoke next()
  // else call next with an err
})

app.param('category', function(req, res, next, category) {
  // search the region map --> a map that takes good regions and turns them into craigslist regions
  // if the region exists in the map
    // set the region to req.body
    // invoke next()
  // else call next with an err
})
  
function sendResults (req, res, next) {
  let options = getSearchParams(req.body);
  search(options).then(results => {
      res.json(results);
  });
};

function sendPost(req, res, next) {
  let options = getPostParams(req.body);
  getPost(options).then(results => {
    res.json(results);
  });
}


console.log('Launch party on port:', port);

