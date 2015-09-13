import URL from 'url-parse'

export function getPostParams(post) {
  let url = new URL(post.url);
  return {
    host: 'http://' + url.hostname,
    path: url.pathname
  }
}

export function getSearchParams(search) {
  return {
    host: 'http://' + search.region + '.craigslist.org',
    path: '/search/' + search.category + '?query=' + search.query
  }
}