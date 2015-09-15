import URL from 'url-parse';
import fs from 'fs';
import Promise from 'bluebird';

var readFile = Promise.promisify(fs.readFile);
var siteMap = '/Users/homestead/Dropbox/Code/talos/server/json/siteMap.json';

export function getPostParams(post) {
  let url = new URL(post.url);
  return {
    host: 'http://' + url.hostname,
    path: url.pathname
  }
}

export function getSearchParams(search) {
  return readFile(siteMap, 'utf-8').then(data => {
    let map = JSON.parse(data);
    let zone = search.zone;
    let territory = search.territory;
    let site = search.site;
    let region = map[zone][territory][site];

    return {
      host: 'http://' + region + '.craigslist.org',
      path: '/search/' + search.category + '?query=' + search.query
    };
  });
}
