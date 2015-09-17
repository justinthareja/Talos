import 'babel/polyfill';
import Spooky from 'spooky';
import _ from 'lodash';

const userAgent = 'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.41 Safari/535.1';

export function search($scope) {
  return new Promise(function(resolve, reject) {
    const searchUrl = $scope.host + $scope.path;
    let spooky = new Spooky({
      casper: {
        logLevel: 'debug',
        verbose: true,
      }
    }, err => {
      if (err) {
        e = new Error('Failed to initialize SpookyJS');
        e.details = err;
        reject(e);
      }
      spooky.start(searchUrl);
      spooky.userAgent(userAgent);
      spooky.then([$scope, getResults]);
      spooky.run();
    });
    
    /******NODE LISTENERS******/
    spooky.on('error', (err, stack) => {
      reject({
        error: err,
        stack: stack
      });
    });

    spooky.on('console', line => {
      console.log(line);
    });

    spooky.on('log', log => {
      if (log.space === 'remote') {
        console.log(log.message.replace(/ \- .*/, ''));
      }
    });

    spooky.on('search complete', results => {
      console.log('Search complete!');
      results.length === 0 ? reject('NO RESULTS FOUND') : resolve(results);
    });

    spooky.on('remote.message', msg => {
      console.log('remote message caught: ' + msg);
    });

    spooky.on('page.error', (err, stack) => {
      reject({
        error: err,
        stack: stack
      });
    });
  });
}

/******CASPER FUNCTIONS******/
function getResults() {
  // Evaluate's second argument takes an object of primitives to be passed into page context
  let results = this.evaluate(function(host) {
    let rowNodes = document.querySelectorAll('.content .row');
    let rowList = [].slice.call(rowNodes);

    return rowList.reduce((list, row) => {
      let post = {};

      post.title = row.getElementsByClassName('hdrlnk')[0].innerText;
      post.timestamp = row.getElementsByTagName('time')[0].getAttribute('title');
      post.postUrl = host + row.getElementsByClassName('hdrlnk')[0].getAttribute('href');
      post.price = null;

      if(row.getElementsByClassName('price')[0]) {
        post.price = row.getElementsByClassName('price')[0].innerText;
      }

      return list.concat(post);
    }, []);
  }, { 
    host: host
  });
  
  this.emit('search complete', results);
}

