import { execFileSync } from 'node:child_process'

import { findTrackedEnvironmentFiles } from './checks.mjs'

const trackedFiles = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
const forbiddenFiles = findTrackedEnvironmentFiles(trackedFiles)

if (forbiddenFiles.length > 0) {
  console.error(`Archivos de entorno versionados: ${forbiddenFiles.join(', ')}`)
  process.exitCode = 1
} else {
  console.log('Configuración de entorno: conforme')
}
