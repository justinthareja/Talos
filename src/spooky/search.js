import Spooky from 'spooky';
import _ from 'lodash';

let searchUrl = 'http://sfbay.craigslist.org/search/sss?query=acura+mdx';


// kick it off
search(searchUrl);  

function search(searchUrl) {
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
    spooky.start(searchUrl);
    spooky.then(function() {
      let host = 'http://sfbay.craigslist.org'
      let results = {};
      results.timestamp = this.getElementsAttribute('time', 'title');
      results.postUrl = this.getElementsAttribute('.hdrlnk', 'href')
            .map(path => host + path);
      results.title = this.evaluate(() => {
        let nodes = document.querySelectorAll('.hdrlnk')
        return [].map.call(nodes, node => node.text);
      });

      this.emit('search complete', results);

    });
    spooky.run();
  });
  /******NODE LISTENERS******/
  spooky.on('error', (e, stack) => {
    console.error(e);
    if(stack) {
      console.log(stack);
    }
  });

  spooky.on('hello', greeting => {
    console.log(greeting)
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
    console.log(zip(results));
  })


function zip(resultsObj) {
  let len = Math.max.apply(null, (_.map(resultsObj, field => field.length)));
  return _.range(0, len - 1).reduce((results, i) => {    
    return results.concat(_.reduce(resultsObj, (memo, content, field) => {
      memo[field] = content[i];
      return memo;
    }, {}));
  }, []);
}

/******CASPER FUNCTIONS******/



