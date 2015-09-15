import 'babel/polyfill';  
import Spooky from 'spooky';
import _ from 'lodash';
import fs from 'fs';
import Promise from 'bluebird';

var write = Promise.promisify(fs.writeFile);
var read = Promise.promisify(fs.read);

const sitesUrl = "http://www.craigslist.org/about/sites";
const userAgent = 'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.41 Safari/535.1';
const writePath = '/Users/homestead/Dropbox/Code/talos/server/json/siteMap.json';


let spooky = new Spooky({
    casper: {
      logLevel: 'debug',
      verbose: true
    }
  }, err => {
    if (err) {
      e = new Error('Failed to initialize SpookyJS');
      e.details = err;
      throw e;
    }
    spooky.start(sitesUrl)
    spooky.userAgent(userAgent);
    spooky.then(function () {
      let regionMap = this.evaluate(function () {
        let map = {};
        let regions = [].slice.call(document.querySelectorAll('h1'));
        let regionData = document.querySelectorAll('.colmask');
        regions.forEach(function(region, i) {
          let regionName = region.innerText;
          let obj = map[regionName] = {};
          let currentRegionData = regionData[i];
          let stateHeaders = [].slice.call(currentRegionData.getElementsByTagName('h4'));
          let stateData = currentRegionData.getElementsByTagName('ul');
          stateHeaders.forEach(function (stateHeader, i) {
            let h = stateHeader.innerText;
            let innerObj = obj[h] = {};
            let currentListOfSites = [].slice.call(stateData[i].getElementsByTagName('a'));
            currentListOfSites.forEach(function(site) {
              let siteName = site.innerText
                .replace(/\/|\(|\)|\./g, '')
                .split(' ')
                .filter(r => r.length > 0)
                .map(r => r[0].toUpperCase() + r.slice(1))
                .join(' ')
                .split('-')
                .join(' ');
              let siteAddress = site.getAttribute('href')
                .split('//')[1]
                .split('.')[0];
              innerObj[siteName] = siteAddress;
            });
          });
        });
        return map;
      });
      this.emit('scrape complete', regionMap);
    }); 
    spooky.run();
  });  

  /******NODE LISTENERS******/
  spooky.on('navigation.requested', function(url, navigationType, navigationLocked, isMainFrame){
    console.log('––––––––––Navigation Requested–––––––––', 'navtype', navigationType)
  })

  spooky.on('error', (e, stack) => {
    console.error(e);
    if(stack) {
      console.log(stack);
    }
  });

  spooky.on('console', line => {
    console.log(line);
  });

  spooky.on('log', log => {
    if (log.space === 'remote') {
      console.log(log.message.replace(/ \- .*/, ''));
    }
  });

  spooky.on('scrape complete', regionMap => {
    console.log('scrape complete')
    fs.writeFile(writePath, JSON.stringify(regionMap), (err, data) => {
      console.log('~~~SUCCESSFULLY WRITTEN~~~ ');
    });
  });

  spooky.on('remote.message', msg => {
    console.log('remote message caught: ' + msg);
  });

  spooky.on('page.error', (msg, trace) => {
    console.log('Error: ' + msg);
  });    

