const request = require('request-promise-native')
const ora = require('ora')
const { formatNumber } = require('accounting')

const spinner = ora({
  text: 'Retrieving Lottery data...',
  color: 'yellow'
})

module.exports = (args) => {
  const contest = args.c || args.concurso
  const query = `${contest ? `?concurso=${contest}` : ''}`
  const token = `!ut/p/a1/jc69DoIwAATgZ_EJepS2wFgoaUswsojYxXQyTfgbjM9vNS4Oordd8l1yxJGBuNnfw9XfwjL78dmduIikhYFGA0tzSFZ3tG_6FCmP4BxBpaVhWQuA5RRWlUZlxR6w4r89vkTi1_5E3CfRXcUhD6osEAHA32Dr4gtsfFin44Bgdw9WWSwj/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0VSC0AC4GLFAD20G6/res/id=buscaResultado/c=cacheLevelPage/=`
  const url = `http://loterias.caixa.gov.br/wps/portal/loterias/landing/quina/${token}/${query}`
  spinner.start()
  return request(url, { jar: true })
    .then(stopSpinner)
    .then(parseResponseToJson)
    .then(extractLotteryValuesFromBody)
    .then(verifyValues)
    .then(verifyError)
    .then(responseConsole)
}

const stopSpinner = (body) => {
  spinner.stop()
  return body
}

const parseResponseToJson = (response) => {
  return JSON.parse(response)
}

const verifyValues = body => {
  if (typeof body.vrEstimativa === 'string') {
    const value = body.vrEstimativa.replace(/[.,]/g, '')
    body.vrEstimativa = value.slice(0, value.length - 2)
    return body
  }
  return body
}

const verifyError = body => {
  return body
}

const extractLotteryValuesFromBody = (body) => {
  return {
    nu_concurso: body.concurso,
    quina: body.ganhadores,
    quadra: body.ganhadores_quadra,
    terno: body.ganhadores_terno,
    duque: body.qt_ganhador_duque,
    vr_quina: body.valor,
    vr_quadra: body.valor_quadra,
    vr_terno: body.valor_terno,
    vr_duque: body.vr_rateio_duque,
    sorteioAcumulado: body.sorteioAcumulado,
    vrEstimativa: body.vrEstimado,
    resultadoOrdenado: body.resultadoOrdenado.replace(/-/g, ' '),
    dt_apuracaoStr: body.dataStr,
    dtProximoConcursoStr: body.dtProximoConcursoStr,
    localSorteio: body.de_local_sorteio,
    no_cidade: body.no_cidade,
    sg_uf: body.sg_uf,
    mensagens: body.mensagens,
    error: body.error
  }
}

const responseConsole = (body) => {
  const responseHeader = `
  -------------------------------------------------
  Concurso: ${body.nu_concurso} - ${body.dt_apuracaoStr}
  Sorteio realizado no ${body.localSorteio} em ${body.no_cidade}, ${body.sg_uf}
  -------------------------------------------------
  `
  console.info(responseHeader)
  console.info(`  ${body.resultadoOrdenado}`)
  console.info(`
  ${showText(body)}

  Quadra: 4 números acertados
  ${body.quadra} apostas ganhadoras, R$ ${formatNumber(body.vr_quadra, 2, '.', ',')}

  Terno: 3 números acertados
  ${body.terno} apostas ganhadoras, R$ ${formatNumber(body.vr_terno, 2, '.', ',')}

  Duque: 2 números acertados
  ${body.duque} apostas ganhadoras, R$ ${formatNumber(body.vr_duque, 2, '.', ',')}
  `)

  console.info(`
  -------------------------------------------------
  Proximo Sorteio ${body.dtProximoConcursoStr}
  Estimativa de prêmio é R$ ${formatNumber(body.vrEstimativa, 2, '.', ',')}
  -------------------------------------------------`)
}

const showText = body => {
  if (body.sorteioAcumulado === true) {
    return ('ACUMULADO!!\n\n  Quina: 15 números acertados\n  Não houve ganhador')
  }
  return (
    'Quina: 15 números acertados 🎉\n  ' + body.quina + ' apostas ganhadoras, R$ ' + formatNumber(body.vr_quina, 2, '.', ',')
  )
}
