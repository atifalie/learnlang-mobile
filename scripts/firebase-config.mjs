import { readFile } from 'node:fs/promises'

export async function firebaseConfigured(path, required = false) {
  let configured = false
  try {
    const firebase = JSON.parse(await readFile(path, 'utf8'))
    configured = Boolean(firebase.project_info?.project_id && firebase.client?.some(
      (client) => client.client_info?.android_client_info?.package_name === 'study.learnlang.app',
    ))
    if (!configured) throw new Error('Firebase configuration does not match study.learnlang.app')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  if (required && !configured) throw new Error('Android push requires google-services.json')
  return configured
}
