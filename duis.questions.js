const _ = require('./helpers')

const markdownREADME = _.markdownToJSON( _.readFile('README.md') )
const metodologia = _.getTableFromMarkdownSection(markdownREADME, 'metodo')

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
    when: answsers => ['quase', 'incompleto'].includes(answsers['cell:nota']),
    filter: answer => answer.split(';').map(a => a.trim()),
  },
  {
    type: 'input',
    name: 'cell:nota',
    message: 'Informe uma nota',
    when: answsers => answsers['cell:nota'] === 'outro',
    validate: input => !isNaN(parseFloat(input)),
    filter: answer => parseFloat(answer).toFixed(2),
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
