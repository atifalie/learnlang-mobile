import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
const root = fileURLToPath(new URL('..', import.meta.url))
const source = resolve(process.argv[2] || root + '/.frontend/dist/spa')
const html = await readFile(source + '/index.html', 'utf8')
if (!html.includes('/assets/')) throw new Error('Expected a production frontend build')
await rm(root + '/www', { recursive: true, force: true })
await mkdir(root + '/www', { recursive: true })
await cp(source, root + '/www', { recursive: true })
await cp(root + '/scripts/native-api.js', root + '/www/native-api.js')
await writeFile(root + '/www/index.html', html.replace('<head>', '<head><script src="/native-api.js"></script>'))
console.log('Prepared bundled frontend assets and native API routing')
