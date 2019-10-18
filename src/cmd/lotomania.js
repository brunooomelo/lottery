const request = require("request-promise-native");
const ora = require("ora");
const { formatNumber } = require("accounting");

const spinner = ora({
  text: "Retrieving Lottery data...",
  color: "yellow"
});

module.exports = args => {
  const contest = args.c || args.concurso;
  const query = `${contest ? `?concurso=${contest}` : ""}`;
  const token = `!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbz8vTxNDRy9_Y2NQ13CDA38jYEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wBmoxN_FydLAGAgNTKEK8DkRrACPGwpyQyMMMj0VAajYsZo!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0JGJVA0AKLR5T3K00V0/res/id=buscaResultado/c=cacheLevelPage/=`;
  const url = `http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotomania/${token}/${query}`;
  spinner.start();
  return request(url, { jar: true })
    .then(stopSpinner)
    .then(parseResponseToJson)
    .then(verifyError)
    .then(extractLotteryValuesFromBody)
    .then(responseConsole)
    .catch(errorHandler);
};

const stopSpinner = body => {
  spinner.stop();
  return body;
};

const parseResponseToJson = response => {
  return JSON.parse(response);
};

const verifyError = body => {
  if (body.mensagens.length === 0) return body;
  throw Error(`
  ⚠ ${body.mensagens[0]}
  `);
};

const extractLotteryValuesFromBody = body => {
  return {
    concurso: body.concurso,
    ganhadores_faixa_1: body.qtGanhadoresFaixa1,
    ganhadores_faixa_2: body.qtGanhadoresFaixa2,
    ganhadores_faixa_3: body.qtGanhadoresFaixa3,
    ganhadores_faixa_4: body.qtGanhadoresFaixa4,
    ganhadores_faixa_5: body.qtGanhadoresFaixa5,
    ganhadores_faixa_6: body.qtGanhadoresFaixa6,
    ganhadores_faixa_7: body.qtGanhadoresFaixa7,
    valor_faixa_1: body.vrRateioFaixa1,
    valor_faixa_2: body.vrRateioFaixa2,
    valor_faixa_3: body.vrRateioFaixa3,
    valor_faixa_4: body.vrRateioFaixa4,
    valor_faixa_5: body.vrRateioFaixa5,
    valor_faixa_6: body.vrRateioFaixa6,
    valor_faixa_7: body.vrRateioFaixa7,
    acumulado: body.acumulado,
    valor_acumulado: body.vrAcumuladoFaixa1,
    vr_estimativa: body.vrEstimativa,
    resultadoOrdenado: body.resultadoOrdenado.replace(/-/g, " "),
    dataStr: body.dtApuracaoStr,
    dt_proximo_concursoStr: body.dtProximoConcursoStr,
    de_local_sorteio: body.icLocalSorteio,
    no_cidade: body.noCidade,
    sg_uf: body.sgUf
  };
};

const responseConsole = body => {
  const responseTemplate = `
  -------------------------------------------------
  Concurso: ${body.concurso} - ${body.dataStr}
  Sorteio realizado ${body.de_local_sorteio} em ${body.no_cidade}, ${body.sg_uf}
  -------------------------------------------------

  ${body.resultadoOrdenado}

  ${
    body.acumulado === 0
      ? winner(body.ganhadores_faixa_1, body.vrRateioFaixa1)
      : "ACUMULADO!!"
  }

  20 números acertados
  ${body.ganhadores_faixa_1} apostas ganhadoras, R$ ${formatNumber(
    body.valor_faixa_1,
    2,
    ".",
    ","
  )}

  19 números acertados
  ${body.ganhadores_faixa_2} apostas ganhadoras, R$ ${formatNumber(
    body.valor_faixa_2,
    2,
    ".",
    ","
  )}

  18 números acertados
  ${body.ganhadores_faixa_3} apostas ganhadoras, R$ ${formatNumber(
    body.valor_faixa_3,
    2,
    ".",
    ","
  )}

  17 números acertados
  ${body.ganhadores_faixa_4} apostas ganhadoras, R$ ${formatNumber(
    body.valor_faixa_4,
    2,
    ".",
    ","
  )}

  16 números acertados
  ${body.ganhadores_faixa_5} apostas ganhadoras, R$ ${formatNumber(
    body.valor_faixa_5,
    2,
    ".",
    ","
  )}

  15 números acertados
  ${body.ganhadores_faixa_7} apostas ganhadoras, R$ ${formatNumber(
    body.valor_faixa_7,
    2,
    ".",
    ","
  )}

  0 números acertados
  ${body.ganhadores_faixa_6} apostas ganhadoras, R$ ${formatNumber(
    body.valor_faixa_6,
    2,
    ".",
    ","
  )}

  -------------------------------------------------
  Proximo Sorteio ${body.dt_proximo_concursoStr}
  Estimativa de prêmio é R$ ${formatNumber(body.vr_estimativa, 2, ".", ",")}
  -------------------------------------------------
  `;
  console.info(responseTemplate);
};

const winner = (bet, priceAmount) => `Sena: 6 números acertados 🎉
  ${bet} apostas ganhadoras, R$ ${formatNumber(priceAmount, 2, ".", ",")}`;

const errorHandler = ({ message }) => {
  spinner.stop();
  console.info(`${message}`);
};
