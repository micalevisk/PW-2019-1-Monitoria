const _ = require('./helpers')

const formatFor = (src, fnCasting = String) => (target, prop, idx) =>
  Object.assign(target, { [prop]: fnCasting(src[idx]) })

const markdownREADME = _.markdownToJSON( _.readFile('README.md') )

const metodologia = _.getTableFromMarkdownSection(markdownREADME, 'metodo')

const lookupCategoriaFromDescricao = metodologia['DESCRIÇÃO'].reduce(formatFor(metodologia['CATEGORIA']), {})

const getCategoriaFromAnswers = answers => answers['cell:nota']

// ref: https://www.npmjs.com/package/inquirer#prompt
const workingdirQuestions = [
  {
    type: 'list',
    name: 'cell:nota',
    message: 'Avaliação',
    choices: metodologia['DESCRIÇÃO'],
    filter: choice => lookupCategoriaFromDescricao[choice],
  },
  {
    type: 'input',
    name: 'note:faltou',
    message: 'O que faltou? (separar por `;`)',
    when: answers => ['quase', 'incompleto'].includes( getCategoriaFromAnswers(answers) ),
    filter: answer => _.splitAndFilter(';', answer),
  },
  {
    type: 'input',
    name: 'note:observação',
    message: 'Observações (separar por `;`)',
    filter: (answer) => {
      const values = _.splitAndFilter(';', answer)
      if (values.length) return values
      return undefined // para não listar no lookup
    },
    transformer: input => input || '',
  },
  {
    type: 'input',
    name: 'cell:nota',
    message: 'Informe uma nota',
    when: answers => getCategoriaFromAnswers(answers) === 'outro',
    validate: input => !isNaN(parseFloat(input)),
    filter: answer => parseFloat(answer).toFixed(2),
  }
]

const lookupNotaFromCategoria = metodologia['CATEGORIA'].reduce(formatFor(metodologia['NOTA'], Number), {})

const lookupAttachExtra = answers => ({
  nota: lookupNotaFromCategoria[ getCategoriaFromAnswers(answers) ],
})

module.exports = {
  myQuestionsToEachWorkingdir: workingdirQuestions,
  myLookupAttachExtra: lookupAttachExtra,
}
