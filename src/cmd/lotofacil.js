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
  const token = `!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbz8vTxNDRy9_Y2NQ13CDA0sTIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wBmoxN_FydLAGAgNTKEK8DkRrACPGwpyQyMMMj0VAcySpRM!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0VSC0AC4GLFAD2003/res/id=buscaResultado/c=cacheLevelPage/=`
  const url = `http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotofacil/${token}/${query}`
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
    nu_concurso: body.nu_concurso,
    ganhadores: body.ganhadores,
    qt_ganhador_faixa1: body.qt_ganhador_faixa1,
    qt_ganhador_faixa2: body.qt_ganhador_faixa2,
    qt_ganhador_faixa3: body.qt_ganhador_faixa3,
    qt_ganhador_faixa4: body.qt_ganhador_faixa4,
    qt_ganhador_faixa5: body.qt_ganhador_faixa5,
    vr_rateio_faixa1: body.vr_rateio_faixa1,
    vr_rateio_faixa2: body.vr_rateio_faixa2,
    vr_rateio_faixa3: body.vr_rateio_faixa3,
    vr_rateio_faixa4: body.vr_rateio_faixa4,
    vr_rateio_faixa5: body.vr_rateio_faixa5,
    sorteioAcumulado: body.sorteioAcumulado,
    valor_acumulado: body.valor_acumulado,
    vrEstimativa: body.vrEstimativa,
    resultadoOrdenado: body.resultadoOrdenado.replace(/-/g, ' '),
    dt_apuracaoStr: body.dt_apuracaoStr,
    dtProximoConcursoStr: body.dtProximoConcursoStr,
    localSorteio: body.localSorteio,
    no_cidade: body.no_cidade,
    sg_uf: body.sg_uf,
    mensagens: body.mensagens,
    error: body.error
  }
}

const responseConsole = (body) => {
  const responseTemplate = `
  -------------------------------------------------
  Concurso: ${body.nu_concurso} - ${body.dt_apuracaoStr}
  Sorteio realizado ${body.localSorteio} em ${body.no_cidade}, ${body.sg_uf}
  -------------------------------------------------
  ${brokenInRow(body.resultadoOrdenado)}

  ${body.sorteioAcumulado && `ACUMULADO!!`}

  ${showText(!body.sorteioAcumulado, '🎉')}
  ${!body.sorteioAcumulado ? `${body.qt_ganhador_faixa1} apostas ganhadoras, R$ ${formatNumber(body.vr_rateio_faixa1, 2, '.', ',')}` : `Não houve ganhador`}

  14 acertos
  ${body.qt_ganhador_faixa2} apostas ganhadoras, R$ ${formatNumber(body.vr_rateio_faixa2, 2, '.', ',')}

  13 acertos
  ${body.qt_ganhador_faixa3} apostas ganhadoras, R$ ${formatNumber(body.vr_rateio_faixa3, 2, '.', ',')}

  12 acertos
  ${body.qt_ganhador_faixa4} apostas ganhadoras, R$ ${formatNumber(body.vr_rateio_faixa4, 2, '.', ',')}

  11 acertos
  ${body.qt_ganhador_faixa5} apostas ganhadoras, R$ ${formatNumber(body.vr_rateio_faixa5, 2, '.', ',')}

  -------------------------------------------------
  Proximo Sorteio ${body.dtProximoConcursoStr}
  Estimativa de prêmio é R$ ${formatNumber(body.vrEstimativa, 2, '.', ',')}
  -------------------------------------------------
  `
  console.info(responseTemplate)
}

const brokenInRow = (string) => {
  const numbers = string.split(' ')
  const result = numbers.reduce((acc, current, index) => {
    if (index % 5 === 0) {
      return { array: [ ...acc.array, numbers.slice(index, index + 5) ],
        string: `${acc.string} \n  ${current}`
      }
    }
    return { array: acc.array, string: `${acc.string} ${current}` }
  }, { array: [], string: '' })
  return result.string
}

const showText = (cond, text) => {
  if (cond === true) return `15 acertos ${text}`
  return '15 acertos'
}
