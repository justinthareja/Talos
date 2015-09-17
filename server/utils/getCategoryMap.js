import 'babel/polyfill';  
import Spooky from 'spooky';
import _ from 'lodash';
import fs from 'fs';
import Promise from 'bluebird';

var write = Promise.promisify(fs.writeFile);
var read = Promise.promisify(fs.read);

const sitesUrl = "http://sfbay.craigslist.org/";
const userAgent = 'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.41 Safari/535.1';
const writePath = '/Users/homestead/Dropbox/Code/talos/server/json/categoryMap.json';


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
      let categories = this.evaluate(function() {
        
        let results = {};
        let headers = [].slice.call(document.querySelectorAll('.ban a'));

        headers.forEach(function(header) {
          let isForum = header.getAttribute('href').split('/').length !== 3;
          let subcategories = [].slice.call(header.parentElement.nextElementSibling.querySelectorAll('a'));
          let headerName = header.querySelector('.txt').innerText;
          let headerPath = header.getAttribute('href');
          
          // skip the discussion forums and resume categories
          if(isForum) {
            return;
          }

          if(headerName === 'resumes') {
            return;
          }

          let category = results[headerName] = {};
          category['path'] = headerPath;
          category['subcategories'] = subcategories.reduce(function(memo, subcategory) {
            let subName = subcategory.querySelector('.txt').innerText
            // some string normalizing
              .replace(/\+/g, ' and ')
              .split('/').map(el => el.trim()).join('-')
              .replace(/\[|\]/g, '').trim();

            let subPath = subcategory.getAttribute('class');
            let subPaths = subPath.split(' ');
            if (subPaths.length > 1) {
              subPath = subPaths[0];
            }

            memo[subName] = '/search/' + subPath;
            return memo;
          }, {});
        });
        return results;
      });
      this.emit('scrape complete', categories);
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

  spooky.on('scrape complete', categoryMap => {
    console.log('scrape complete');
    fs.writeFile(writePath, JSON.stringify(categoryMap, null, 2), (err, data) => {
      console.log('~~~SUCCESSFULLY WRITTEN~~~ ');
    });
  });

  spooky.on('remote.message', msg => {
    console.log('remote message caught: ' + msg);
  });

  spooky.on('page.error', (msg, trace) => {
    console.log('Error: ' + msg);
  });    

