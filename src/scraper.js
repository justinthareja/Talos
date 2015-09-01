import Spooky from 'spooky';

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

  spooky.start('http://en.wikipedia.org/wiki/Spooky_the_Tuff_Little_Ghost');
  spooky.then(function () {
    this.evaluate(function () {
      __utils__.echo('we in the page context')
    });
  })
  spooky.run();
})

spooky.on('error', (e, stack) => {
  console.error(e);

  if(stack) {
    console.log(stack);
  }
})

spooky.on('hello', greeting => {
  console.log(greeting)
})


// // Uncomment this block to see all of the things Casper has to say.
// // There are a lot.
// // He has opinions.
// spooky.on('console', function (line) {
//     console.log(line);
// });


// spooky.on('log', function (log) {
//     if (log.space === 'remote') {
//         console.log(log.message.replace(/ \- .*/, ''));
//     }
// });