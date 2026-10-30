// Packaged assets use the production app origin for same-site session cookies.
// API traffic must reach the API host rather than Capacitor's local asset server.
(() => {
  const apiOrigin = 'https://api.learnlang.study'
  const apiPath = /^\/(graphql|sanctum|broadcasting\/auth|profile-avatar|profile-cover|stories|device-context|vibes|storage)(\/|$)/
  function endpoint(input) {
    const url = new URL(input, window.location.origin)
    return url.origin === window.location.origin && apiPath.test(url.pathname)
      ? apiOrigin + url.pathname + url.search
      : null
  }
  const fetch = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const mapped = endpoint(input instanceof Request ? input.url : input)
    if (!mapped) return fetch(input, init)
    if (input instanceof Request) {
      const request = new Request(input, init)
      return fetch(new Request(mapped, request), { credentials: 'include' })
    }
    return fetch(mapped, { ...init, credentials: 'include' })
  }
  const open = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    const mapped = endpoint(url)
    const result = open.call(this, method, mapped || url, ...rest)
    if (mapped) this.withCredentials = true
    return result
  }
})()
