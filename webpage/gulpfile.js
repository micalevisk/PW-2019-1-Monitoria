const gulp = require('gulp')
const gulpEjsMonster = require('gulp-ejs-monster')

const fs = require('fs')
const path = require('path')
const _ = require('../helpers')

const PATHS_TO_LOOKUP_FILES = [
  ['TURMA_ES01-ES02', '../TURMA_ES01-ES02/__meta__/.duis.lookup'],
  // ^ para identificar no `.gitmodules`
]

function mergeLookups(pathToLookupsDir, usernamesToURL) {
  const lookupFilenames = fs.readdirSync(pathToLookupsDir)
  let hasSomeNote = false

  const getPrompt = (prompts, predicate, cbIfFound) => {
    const prompt = prompts.find(({ q }) => predicate(q))
    if (prompt && ('a' in prompt)) {
      if (typeof cbIfFound === 'function') cbIfFound()
      return prompt
    }
  }

  const getNote = prompts => getPrompt(
    prompts,
    q => q.startsWith('note:'),
    () => hasSomeNote = true,// side-effect
  )

  const getCellNota = prompts => getPrompt(
    prompts,
    q => q === 'cell:nota',
  )

  return lookupFilenames.reduce((lookups, lookupFilename) => {
    hasSomeNote = false

    const currLookupFilePath = path.join(pathToLookupsDir, lookupFilename)
    const currLookup = JSON.parse( fs.readFileSync(currLookupFilePath).toString() )

    const username = path.basename(lookupFilename, '.json')
    const meta = Object.entries(currLookup).map(([entryId, value]) => ({
      entry: entryId,
      commit: value._id,
      promptNote: getNote(value.prompts),
      promptCell: getCellNota(value.prompts),
      extra: value.extra,
    }))

    lookups.push({
      username,
      repoURL: usernamesToURL[username],
      lookup: meta,
      hasSomeNote,
    })

    return lookups
  }, [])
}

function createSubmodulesMetadata(gitSubmodulesPath) {
  const lines = fs.readFileSync(gitSubmodulesPath).toString().split(/\n\r?/)
  const classes = {}

  const usernamesToURL = (pathToLocalRepo) => {
    const group = {}
    let currUsername, newSubmodule = false

    for (const line of lines) {
      if (line.trim().startsWith('[submodule ')) {
        newSubmodule = true
        continue
      }

      if (!newSubmodule) continue

      const matches = line.trim().match(/^(path|url)\s*=\s*(.+)/i)
      if (!matches) continue

      const [, key, value] = matches

      if (key.toLowerCase() === 'path') {
        if (value.startsWith(pathToLocalRepo)) {
          const username = value.replace(pathToLocalRepo, '')
          currUsername = username
        }
      } else if (key.toLowerCase() === 'url') {
        group[currUsername] = value
        newSubmodule = false
        currUsername = ''
      }
    }

    return group
  }

  for (const [root, pathToLookupFile] of PATHS_TO_LOOKUP_FILES) {
    const absPathToLookupFile = path.join(__dirname, pathToLookupFile)
    classes[root] = mergeLookups(absPathToLookupFile, usernamesToURL(root + '/'))
  }

  return classes
}

const classes = createSubmodulesMetadata( path.join(__dirname, '..', '.gitmodules') )

const formatFor = (src, fnCasting = String) => (target, prop, idx) =>
  Object.assign(target, { [prop]: fnCasting(src[idx]) })

const markdownREADME = _.markdownToJSON( _.readFile('README.md') )

const metodologia = _.getTableFromMarkdownSection(markdownREADME, 'metodo')
const lookupDescriptionFromCategory = metodologia['CATEGORIA'].reduce(formatFor(metodologia['DESCRIÇÃO']), {})

const tabelaPrazos = _.getTableFromMarkdownSection(markdownREADME, 'prazos')
const lookupEntryToLink = tabelaPrazos['ATIVIDADE'].reduce((acum, curr) => {
  const [, entry, link] = curr.match(/\[([^\]]+)\]\((.+)\)/)
  acum[entry] = 'https://github.com/micalevisk/PW-2019-1-Monitoria/blob/master/' + link.slice(2) + '?raw=true'
  return acum
}, {})



//  ██████╗ ██╗   ██╗██╗     ██████╗
// ██╔════╝ ██║   ██║██║     ██╔══██╗
// ██║  ███╗██║   ██║██║     ██████╔╝
// ██║   ██║██║   ██║██║     ██╔═══╝
// ╚██████╔╝╚██████╔╝███████╗██║
//  ╚═════╝  ╚═════╝ ╚══════╝╚═╝
process.chdir(__dirname)


gulp.task('ejs:build', () =>
  gulp.src('./templates/*.ejs')
      .pipe(gulpEjsMonster({
        layouts: './templates/',
        includes: './templates/',
        requires: '../',
        widgets: './templates/widgets/',
        locals: {
          // array de array "tuplas" no formato [TURMA, alunos]
          classList: Object.entries(classes),
          lookupDescriptionFromCategory,
          lookupEntryToLink,
        }
      }).on('error', gulpEjsMonster.preventCrash))
      .pipe(gulp.dest('./dist'))
)

gulp.task('copy', () =>
  gulp.src('./public/**')
      .pipe(gulp.dest('./dist'))
)

gulp.task(
  'build',
  gulp.series('copy', 'ejs:build')
)

gulp.task('watch', () => {
  gulp.watch(['./templates/**/*'], gulp.series('ejs:build'))
})

gulp.task(
  'build',
  gulp.series('copy', 'ejs:build')
)


gulp.task(
  'default',
  gulp.series( gulp.parallel('build', 'watch') )
)
