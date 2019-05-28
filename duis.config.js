/**************************************************************************************************
██████╗ ███████╗███████╗ ██████╗██████╗ ██╗██████╗ ████████╗██╗ ██████╗ ███╗   ██╗
██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██║██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
██║  ██║█████╗  ███████╗██║     ██████╔╝██║██████╔╝   ██║   ██║██║   ██║██╔██╗ ██║
██║  ██║██╔══╝  ╚════██║██║     ██╔══██╗██║██╔═══╝    ██║   ██║██║   ██║██║╚██╗██║
██████╔╝███████╗███████║╚██████╗██║  ██║██║██║        ██║   ██║╚██████╔╝██║ ╚████║
╚═════╝ ╚══════╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝

workingdir = diretório que será alvo da correção
  - será aberto pelo browser e servido como document root pelo servidor PHP
  - junção do `workingdirParentDirPathMask` e caminho pro diretório do trabalho a ser corrigido

parent dir = diretório pai do `workingdir`
  - será usado como ponto de referência para encontrar todos os `workingdir`
  - deve estar 1 nível atrás do `workingdir`
  - seu caminho estará descrito na variável `workingdirParentDirPathMask`

root dir = diretório que contém o `.git`
  - será usado para realizar comandos Git
  - estará no mesmo nível que os demais diretórios git (dos outros alunos), portanto deve ser único
  - o nome desse dir. será usado como nome do arquivo de lookup
  - a variável `levelsToRootDir` indica seu caminho em relação ao `workingdir`
**************************************************************************************************/

//  ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗ ███████╗
// ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝ ██╔════╝
// ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗███████╗
// ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║╚════██║
// ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝███████║
//  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝

const { myQuestionsToEachWorkingdir, myLookupAttachExtra } = require('./duis.questions')

// perguntas cuja respostas definirão mais variáveis na config abaixo
// Se `name` estiver com todas as letras em maiúsculo, a resposta será tratada como variável a ser usada nos templates
const myStartQuestions = [
  {
    type: 'input',
    name: 'TURMA',
    message: 'Turma (dir. pai dos repos dos alunos)',
    default: 'TURMA_NOITE',
    validate: answer => !answer.trim() ? 'Informe algo' : true
  },
  {
    type: 'input',
    name: 'ENTRY',
    message: 'id do exercício que será corrigido',
    validate: answer => {
      if (!input.trim()) return 'Informe algo!'
      return (/^(HTML|CSS|JS|DOM|Node)\d+$/).test(answer) ? 'Formato inválido' : true
    }
  }
]

module.exports = {

  // template do diretório que registrará as correções realizadas
  lookupDirPathMask: './{TURMA}/__meta__/.duis.lookup/',

  // template do diretório parent ao que será passado como arg do Duis
  workingdirParentDirPathMask: './{TURMA}/*/',

  // a partir do diretório "workingdir", é preciso voltar quantos níveis para ir ao que tem o `.git` (do aluno)?
  levelsToRootDir: 0, // 0 se não for existir um diretório de trabalho específico, i.e., usado em `duis .`

  /*************************** OPCIONAIS ***************************/

  // glob pattern dos arquivos que serão ignorados nas buscas do duis-exec
  excludeMasks: [
    './{TURMA}/**/__*__', // excluindo qualquer arquivo que inicie e termine com `__`
  ],

  // nome padrão para o identificador no lookup
  entryDirName: '', // se for um valor falsy, o padrão será inferido a partir dos argumentos do duis-exec

  // configuração da sessão que será usada no duis-exec
  session: {
    // `true` se deseja iniciar uma nova sessão
    new: false,
    // caminho para o arquivo de sessão
    file: '.duis.session' // se for um valor falsy, a sessão não será salva
  },

  // navegador que abrirá na pasta do aluno (ou o server, se iniciado)
  browser: {
    name: 'chrome',
    opts: '--incognito', // as opções que o navegador suporta, separadas por espaço
    autoOpen: true, // se o navegador deve ser aberto automaticamente a cada "workingdir"
  },

  // configuração do servidor para o duis-exec
  server: {
    // caminho para o arquivo binário (executável)
    bin: 'php', // atualmente, suporta apenas o CLI do PHP
    port: 8080 // porta em que o servidor tentará escutar
  },

  _test: {// o underscore é apenas para que o Duis não encontre esta config `test`, já que não está realmente definida aqui
    // como devem terminar os arquivos de testes, i.e, a extensão deles
    fileExtName: '.test.js',
    // template do diretório em que estarão descritos os testes para cada "trabalho" (workingdir)
    dirPathMask: './{TURMA}/__tests__', // os arquivos devem estar no formato: `<ENTRY_DIR>.<fileExtName>`
    // comando que será executado sobre o arquivo de "teste" do trabalho corrente
    command: 'testcafe chrome:headless --color -u'
  },

  // questões a serem respondidas imediatamente após o setup das config
  startQuestions: myStartQuestions,

  // questões a serem respondidas após realizar os testes, i.e., após abrir o navegador no "workingdir" corrente
  workingdirQuestions: myQuestionsToEachWorkingdir,

  // função pura que receberá as repostas dadas a `workingdirQuestions` retornará um objeto que será o valor da propriedade `extra` do objeto a ser gravado no lookup file, para o workingdir corrente
  lookupAttachExtra: myLookupAttachExtra,

  // comandos a serem executados na linha de comandos em alguns estágios do duis-exec
  hooks: {
    // antes de procurar pelos diretórios
    beforeStart: [
      ['firefox', 'https://github.com/micalevisk/PW-2019-1-Monitoria/blob/master/exerc%C3%ADcios/{ENTRY}.png'],
      ['./scripts/git-submodule.sh', 'pull'],
      ['pw-update-spreadsheet', './{TURMA}/__meta__/.duis.lookup'],
    ],

    // antes de abrir o navegador na pasta do aluno -- assim que entrar no "workingdir"
    onEnterWD: [],

    // após parar o servidor -- antes de seguir para o próximo "workingdir"
    beforeLeaveWD: [],

    // após ter percorrido todos os "workingdir" encontrados
    onFinish: [
      ['pw-update-spreadsheet', './{TURMA}/__meta__/.duis.lookup'],
      // |                      ^------- command arguments
      // +----- command
      // ^ usando um programa interno que sincronizará os lookups com um Google Spreadsheet
    ]
  },

  // `true` para sempre confirmar a execução de comandos definidos pelo usuário
  safe: true,

}
