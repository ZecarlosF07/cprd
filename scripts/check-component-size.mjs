import { readdirSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'

import { findOversizedComponents } from './checks.mjs'

function listTsxFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return listTsxFiles(path)
    return extname(entry.name) === '.tsx' ? [path] : []
  })
}

const entries = listTsxFiles('src').map((file) => ({
  file,
  source: readFileSync(file, 'utf8'),
}))
const oversized = findOversizedComponents(entries)

if (oversized.length > 0) {
  oversized.forEach(({ file, lines }) => console.error(`${file}: ${lines} líneas no vacías`))
  process.exitCode = 1
} else {
  console.log('Tamaño de componentes: conforme')
}
