import 'babel/polyfill';
import Spooky from 'spooky';
import _ from 'lodash';

const params = {
  host: 'http://sfbay.craigslist.org',
  path: '/search/sss?query=acura+mdx',
  userAgent: 'Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.41 Safari/535.1'
}

// kick it off
search(params);  

function search($scope) {
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

function zip(resultsObj) {
  let len = Math.max.apply(null, (_.map(resultsObj, field => field.length)));
  return _.range(0, len - 1).reduce((results, i) => {    
    return results.concat(_.reduce(resultsObj, (memo, content, field) => {
      memo[field] = content[i];
      return memo;
    }, {}));
  }, []);
}


function getResults() {
  let $$scope = arguments.length;
  console.log(JSON.stringify($$scope));
  let results = this.evaluate(function() {
    let $scope = arguments[0];
    // console.log(arguments);
    // console.log(JSON.stringify(params))
    // let host = 'http://sfbay.craigslist.org'
    // let rowNodes = document.querySelectorAll('.content .row');
    // let rowList = [].slice.call(rowNodes);
    // // let rowList = [...rowNodes];
    // return rowList.reduce(function(list, row) {
    //   let price = null;
    //   if(row.getElementsByClassName('price')[0]) {
    //     price = row.getElementsByClassName('price')[0].innerText 
    //   } 
    //   list.push({
    //       price: price,
    //       title: row.getElementsByClassName('hdrlnk')[0].innerText,
    //       postUrl: host + row.getElementsByClassName('hdrlnk')[0].getAttribute('href'),
    //       timestamp: row.getElementsByTagName('time')[0].getAttribute('title')
    //   });
    //   return list;
    // }, []);
  }, {
    host: host,
  });
  
  this.emit('search complete', results);

}

/* or this
function zip(resultsObj) {
  let len = Math.max.apply(null, (_.map(resultsObj, field => field.length)));
  let results = [];

  for (var i = 0; i < len; i++) {
    let obj = {};
    for (field in resultsObj) {
      obj[field] = resultsObj[field];
    }
    results.push(obj);
  }

  return results;
}
*/
/******CASPER FUNCTIONS******/



