import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const sha = process.argv[2]
if (!/^[a-f0-9]{40}$/.test(sha || '')) throw new Error('Usage: npm run release:source -- <full frontend commit SHA>')
const root = fileURLToPath(new URL('..', import.meta.url))
const file = root + '/frontend.json'
const config = JSON.parse(await readFile(file, 'utf8'))
config.commit = sha
await writeFile(file, JSON.stringify(config, null, 2) + '\n')
execFileSync('git', ['add', 'frontend.json'], { cwd: root, stdio: 'inherit' })
const changed = execFileSync('git', ['diff', '--cached', '--name-only'], { cwd: root, encoding: 'utf8' }).trim()
if (!changed) { console.log('This frontend revision is already selected'); process.exit(0) }
if (changed !== 'frontend.json') throw new Error('Other files are staged; commit those separately before releasing')
execFileSync('git', ['commit', '-m', 'Build APK for frontend ' + sha.slice(0, 7)], { cwd: root, stdio: 'inherit' })
execFileSync('git', ['push', 'origin', 'main'], { cwd: root, stdio: 'inherit' })
