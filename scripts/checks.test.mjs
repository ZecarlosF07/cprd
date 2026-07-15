import { describe, expect, it } from 'vitest'

import { countNonEmptyLines, findOversizedComponents, findTrackedEnvironmentFiles } from './checks.mjs'

describe('controles del repositorio', () => {
  it('permite solo el ejemplo de variables de entorno', () => {
    expect(findTrackedEnvironmentFiles(['.env', '.env.local', '.env.example', 'src/main.tsx']))
      .toEqual(['.env', '.env.local'])
  })

  it('cuenta únicamente líneas no vacías', () => {
    expect(countNonEmptyLines('primera\n\n  \nsegunda\n')).toBe(2)
  })

  it('reporta componentes que exceden el máximo', () => {
    const source = Array.from({ length: 121 }, (_, index) => `línea ${index}`).join('\n')
    expect(findOversizedComponents([{ file: 'Grande.tsx', source }]))
      .toEqual([{ file: 'Grande.tsx', lines: 121 }])
  })
})
