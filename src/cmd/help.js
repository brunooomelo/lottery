const menus = {
  main: `
    Usage: lottery <command> [flags]

    where <command> is one of:
        megasena

    lottery help <command>  quick help on <command>`,

  megasena: `
    lottery megasena <options>

    --concurso, -c  .......... show contest result
  `
}

module.exports = (args) => {
  const subCmd = args._[0] === 'help'
    ? args._[1]
    : args._[0]

  console.log(menus[subCmd] || menus.main)
}
