const minimist = require('minimist')
const error = require('./utils/error')

module.exports = () => {
  const args = minimist(process.argv.slice(2))
  let cmd = args._[0] || 'help'
  if (args.version || args.v) {
    cmd = 'version'
  }
  if (args.help || args.h) {
    cmd = 'help'
  }

  switch (cmd) {
    case 'help':
      require('./cmd/help')(args)
      break
    case 'version':
      require('./cmd/version')(args)
      break
    case 'megasena':
      require('./cmd/megasena')(args)
      break
    case 'lotofacil':
      require('./cmd/lotofacil')(args)
      break
    case 'quina':
      require('./cmd/quina')(args)
      break
    case 'lotomania':
      require('./cmd/lotomania')(args)
      break
    default:
      error(`"${cmd}" is not a valid command!`, true)
      break
  }
}
