export const ENV_FILE_PATTERN = /^\.env(?:\..+)?$/

export function findTrackedEnvironmentFiles(files) {
  return files.filter((file) => ENV_FILE_PATTERN.test(file) && file !== '.env.example')
}

export function countNonEmptyLines(source) {
  return source.split(/\r?\n/).filter((line) => line.trim().length > 0).length
}

export function findOversizedComponents(entries, maximumLines = 120) {
  return entries
    .map(({ file, source }) => ({ file, lines: countNonEmptyLines(source) }))
    .filter(({ lines }) => lines > maximumLines)
    .sort((left, right) => right.lines - left.lines)
}
