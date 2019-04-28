module.exports.findValueByKey = function findValueByKey(obj, keyToLookup, predicate = (key) => (key === keyToLookup)) {
  if (!obj || !(obj instanceof Object) || !keyToLookup) return;

  if (keyToLookup instanceof Function) predicate = keyToLookup

  for (const [key, value] of Object.entries(obj)) {
    if (predicate(key, keyToLookup)) return value;
    const valueFound = findValueByKey(value, keyToLookup, predicate);
    if (valueFound) return valueFound;
  }
}

module.exports.markdownTableToJSON = function markdownTableToJSON(mdTableStr) {
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
