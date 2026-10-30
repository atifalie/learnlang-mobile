import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'
const source = readFileSync(new URL('../scripts/native-api.js', import.meta.url), 'utf8')
function fixture() {
  const calls = []
  class XHR { open(...args) { calls.push(args) } }
  const window = { location: { origin: 'https://app.learnlang.study' }, fetch: (...args) => calls.push(args) }
  runInNewContext(source, { window, XMLHttpRequest: XHR, URL, Request })
  return { window, calls, XHR }
}
test('native REST requests keep method, body, XSRF header and session credentials', () => {
  const { window, calls } = fixture()
  window.fetch('/profile-avatar', { method: 'POST', body: 'photo', headers: { 'X-XSRF-TOKEN': 'csrf' } })
  assert.equal(calls[0][0], 'https://api.learnlang.study/profile-avatar')
  assert.equal(calls[0][1].method, 'POST')
  assert.equal(calls[0][1].body, 'photo')
  assert.equal(calls[0][1].headers['X-XSRF-TOKEN'], 'csrf')
  assert.equal(calls[0][1].credentials, 'include')
})
test('CDN and bundled assets retain their original destination', () => {
  const { window, calls } = fixture()
  for (const url of ['/assets/app.js', 'https://cdn.learnlang.study/photo.jpg']) window.fetch(url)
  assert.equal(calls[0][0], '/assets/app.js')
  assert.equal(calls[1][0], 'https://cdn.learnlang.study/photo.jpg')
})
test('GraphQL and private-channel auth XHR use the live API', () => {
  const { calls, XHR } = fixture()
  const auth = new XHR()
  auth.open('POST', '/broadcasting/auth', true)
  assert.equal(auth.withCredentials, true)
  new XHR().open('POST', 'https://app.learnlang.study/graphql', true)
  assert.equal(calls[0][1], 'https://api.learnlang.study/broadcasting/auth')
  assert.equal(calls[1][1], 'https://api.learnlang.study/graphql')
})
test('Request objects preserve their request metadata when routed', () => {
  const { window, calls } = fixture()
  window.fetch(new Request('https://app.learnlang.study/stories', { headers: { Accept: 'application/json' } }))
  assert.equal(calls[0][0].url, 'https://api.learnlang.study/stories')
  assert.equal(calls[0][0].headers.get('Accept'), 'application/json')
})
