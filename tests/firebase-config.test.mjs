import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { test } from 'node:test'
import { firebaseConfigured } from '../scripts/firebase-config.mjs'

test('debug builds can omit Firebase but required releases cannot', async (t) => {
  const root = await mkdtemp(tmpdir() + '/learnlang-firebase-')
  t.after(() => rm(root, { recursive: true, force: true }))
  assert.equal(await firebaseConfigured(root + '/missing.json'), false)
  await assert.rejects(firebaseConfigured(root + '/missing.json', true), /requires google-services/)
})
test('Firebase client configuration must match the Android application', async (t) => {
  const root = await mkdtemp(tmpdir() + '/learnlang-firebase-')
  t.after(() => rm(root, { recursive: true, force: true }))
  const path = root + '/client.json'
  const config = { project_info: { project_id: 'local-fixture' }, client: [
    { client_info: { android_client_info: { package_name: 'another.app' } } },
  ] }
  await writeFile(path, JSON.stringify(config))
  await assert.rejects(firebaseConfigured(path, true), /does not match/)
  config.client[0].client_info.android_client_info.package_name = 'study.learnlang.app'
  await writeFile(path, JSON.stringify(config))
  assert.equal(await firebaseConfigured(path, true), true)
})
