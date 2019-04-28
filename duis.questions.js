const path = require('path')
const fs = require('fs')
const { parse: md2jsonParser } = require('md-2-json')
const _ = require('./helpers')

const MD_README_FILE_CONTENT = fs.readFileSync(
  path.join(__dirname, 'README.md')
  //       \________/
  //           |
  //           +---> necessário pois este script será usado em outro CWD, então não basta `./metodologia.txt`
).toString()

const { raw: markdownTable } = _.findValueByKey(
  md2jsonParser(MD_README_FILE_CONTENT),
  key => key.startsWith('<!-- :metodo -->')
)

const metodologia = _.markdownTableToJSON(markdownTable)

const formatFor = (src, fnCasting = String) => (target, prop, idx) =>
  Object.assign(target, { [prop]: fnCasting(src[idx]) })

const lookupsForLabels = metodologia['DESCRIÇÃO'].reduce(formatFor(metodologia['CATEGORIA']), {})


// ref: https://www.npmjs.com/package/inquirer#prompt
const workingdirQuestions = [
  {
    type: 'list',
    name: 'cell:nota',
    message: 'Avaliação',
    choices: metodologia['DESCRIÇÃO'],
    filter: choice => lookupsForLabels[choice],
  },
  {
    type: 'input',
    name: 'note:faltou',
    message: 'O que faltou? (separar por `;`)',
    when: answsers => answsers['cell:nota'] === 'quase',
    filter: answser => answser.split(';').map(a => a.trim()),
  }
]

const lookupAttachExtra = (answers) => {
  const mapper = metodologia['CATEGORIA'].reduce(formatFor(metodologia['NOTA'], Number), {})
  return {
    'nota': mapper[answers['cell:nota']]
  }
}

module.exports = {
  myQuestionsToEachWorkingdir: workingdirQuestions,
  myLookupAttachExtra: lookupAttachExtra,
}
