import 'babel/polyfill';
import Spooky from 'spooky';
import _ from 'lodash';

const params = {
  host: 'http://sfbay.craigslist.org',
  path: '/search/sss?query=lexus',
  userAgent: 'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.41 Safari/535.1'
}

// kick it off
search(params);  

export function search($scope) {
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
      throw e;
    }
    spooky.start(searchUrl);
    spooky.userAgent($scope.userAgent);
    spooky.then([$scope, getResults]);
    spooky.run();
  });
  
  /******NODE LISTENERS******/
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

  spooky.on('search complete', results => {
    console.log('search complete here ya go:', results)
  })

  spooky.on('remote.message', msg => {
    console.log('remote message caught: ' + msg);
  })

  spooky.on( 'page.error', (msg, trace) => {
    console.log('ERROR: ' + msg);
  });
}

/******CASPER FUNCTIONS******/
function getResults() {
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

