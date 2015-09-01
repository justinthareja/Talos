let postUrl = 'http://sfbay.craigslist.org/sby/hsh/5200286628.html';

casper.test.begin('Selectors', 2, function(test) {
  casper.start(postUrl, function() {
    logExists('#replylink', 'Found contact info page');
    logExists('#postingbody', 'Found main post body');
    logExists('#thumbs a', 'Found images');
    logExists('#map', 'Found geocoordinates');
    logExists('.postingtitletext small', 'Region information found');
    logExists('.price', 'Price found');
  }).run(function() {
    test.done();
  });
});

// look for selectors on the page, and only get selectors that exist
// once you have a list of selectors that exist, check to see the contents of them match what's expected
// for each prop in post props
// remove it if it doesn't exist

const postSelectors = {
  '#replylink': 'Found contact info page',
  '#postingbody': 'Found main post body',
  '#thumbs a': 'Found images',
  '#map': 'Found geocoordinates',
  '.postingtitletext small': 'Found region information',
  '.price': 'Found price'
}

const contactSelectors = {
  name: '.reply_options ul > li', 
  phone:'.replytellink@href', 
  email: '.anonemail' 
}
