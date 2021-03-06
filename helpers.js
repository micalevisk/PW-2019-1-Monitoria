// Ensure we're in the project directory, so relative paths work as expected
process.chdir(__dirname)

const fs = require('fs')
const md2jsonParser = require('md-2-json')

module.exports.markdownToJSON = md2jsonParser.parse

/**
 * @param {string} pathToFile
 * @returns {string}
 */
module.exports.readFile = function (pathToFile) {
  return fs.readFileSync(pathToFile).toString()
}

function findValueByKey(obj, keyToLookup, predicate = (key) => (key === keyToLookup)) {
  if (!obj || !(obj instanceof Object) || !keyToLookup) return

  if (keyToLookup instanceof Function) predicate = keyToLookup

  for (const [key, value] of Object.entries(obj)) {
    if (predicate(key, keyToLookup)) return value
    const valueFound = findValueByKey(value, keyToLookup, predicate)
    if (valueFound) return valueFound
  }
}

function markdownTableToJSON(mdTableStr) {
  const [header,,...rows] = mdTableStr
    .split(/\r?\n/)
    .filter(l => l.trim())
    .map(l => l.trim().substr(1).slice(0, -1).split('|'))

  return header
    .reduce((sheet, header, idx) => {
      return Object.assign(sheet, {
        [header.trim()]: rows.map(row => row[idx].trim())
      })
    }, {})
}

/**
 * @param {string} mdContent
 * @param {string} sectionId
 * @returns {string}
 */
module.exports.getTableFromMarkdownSection = function (mdContent, sectionId) {
  const { raw: mdSection} = findValueByKey(mdContent, key => key.startsWith(`<!-- :${sectionId} -->`))
  const indexStartTable = mdSection.indexOf('|')
  return markdownTableToJSON(mdSection.substr(indexStartTable))
}

/**
 *
 * @param {string} sep
 * @param {string} input
 * @returns {string[]}
 */
module.exports.splitAndFilter = function (sep, input) {
  return input.split(sep).reduce((validVals, val) => {
    const normalizedVal = val.trim()
    if (normalizedVal.length) validVals.push(normalizedVal)
    return validVals
  }, [])
}
