import express from 'express';
import bodyParser from 'body-parser';
import {search} from './utils/search.js';
import {getPost} from './utils/getPost.js';
import {getSearchParams, getPostParams} from './utils/queryBuilder.js';
import fs from 'fs';
import Promise from 'bluebird';


export var app = express();

var readFile = Promise.promisify(fs.readFile);
const port = 1337;

app.use(bodyParser.json());
app.post('/api/search', verifySearchParams, sendSearchResults);
app.post('/api/post', sendPost);
app.listen(port);


function verifySearchParams(req, res, next) {
  if (!req.body.zone) res.status(400).send('No zone found'); 
  if (!req.body.territory) res.status(400).send('No territory found'); 
  if (!req.body.site) res.status(400).send('No site found'); 
  if (!req.body.category) res.status(400).send('No category found'); 
  if (!req.body.query) res.status(400).send('No query found'); 
  // TODO: verify category and site from siteMap and categoryMap
  next();
}

function sendSearchResults (req, res, next) {
  getSearchParams(req.body)
    .then(search)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      res.status(500).send(err)
    });
};

function sendPost(req, res, next) {
  let options = getPostParams(req.body);
  getPost(options)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      res.status(500).send(err)
    });
}

console.log('Launch party on port:', port);

