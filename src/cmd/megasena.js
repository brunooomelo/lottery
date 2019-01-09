const request = require('request-promise-native')
const ora = require('ora')
const { formatNumber } = require('accounting')

const spinner = ora({
  text: 'Retrieving Lottery data...',
  color: 'yellow',
})

module.exports = (args) => {
  const contest = args.c || args.concurso
  const query = `${contest? `?concurso=${contest}` : '' }`
  const token = `!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA0sjIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wNnUwNHfxcnSwBgIDUyhCvA5EawAjxsKckMjDDI9FQE-F4ca/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO6H80AU71KG7J0072/res/id=buscaResultado/c=cacheLevelPage/=`
  const url = `http://loterias.caixa.gov.br/wps/portal/loterias/landing/megasena/${token}/${query}`
  spinner.start()
  return request(url, { jar:true })
    .then(stopSpinner)
    .then(parseResponseToJson)
    .then(extractLotteryValuesFromBody)
    .then(responseConsole)
    .catch(errorHandler)
}

const stopSpinner = (body) => {
  spinner.stop()
  return body
}

const parseResponseToJson = (response) => {
  return JSON.parse(response)
}

const extractLotteryValuesFromBody = (body) => {
  return {
    concurso: body.concurso,
    ganhadores: body.ganhadores,
    ganhadores_quina: body.ganhadores_quina,
    ganhadores_quadra: body.ganhadores_quadra,
    valor: body.valor,
    valor_quina: body.valor_quina,
    valor_quadra: body.valor_quadra,
    acumulado: body.acumulado,
    valor_acumulado: body.valor_acumulado,
    vr_estimativa: body.vr_estimativa,
    resultadoOrdenado: body.resultadoOrdenado.replace(/-/g, ' '),
    dataStr: body.dataStr,
    dt_proximo_concursoStr: body.dt_proximo_concursoStr,
    de_local_sorteio: body.de_local_sorteio,
    no_cidade: body.no_cidade,
    sg_uf: body.sg_uf,
  }
}

const responseConsole = (body) => {
  const responseTemplate = `
  -------------------------------------------------
  Concurso: ${body.concurso} - ${body.dataStr}
  Sorteio realizado ${body.de_local_sorteio} em ${body.no_cidade}, ${body.sg_uf}
  -------------------------------------------------

  ${body.resultadoOrdenado}

  ACUMULADO!!

  Quina: 5 números acertados
  ${body.ganhadores_quina} apostas ganhadoras, R$ ${formatNumber(body.valor_quina, 2, ".", ",")}

  Quadra: 4 números acertados
  ${body.ganhadores_quadra} apostas ganhadoras, R$ ${formatNumber(body.valor_quadra, 2, ".", ",")}

  -------------------------------------------------
  Proximo Sorteio ${body.dt_proximo_concursoStr}
  Estimativa de prêmio é R$ ${formatNumber(body.vr_estimativa, 2, ".", ",")}
  -------------------------------------------------
  `
  console.info(responseTemplate)
}

const errorHandler = (error) => {
  spinner.stop()
  console.error(`${error}`)
}
