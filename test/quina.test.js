const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const nock = require('nock')
const { formatNumber } = require('accounting')

const expect = chai.expect
chai.use(sinonChai)

const quina = require('../src/cmd/quina')

describe('Quina', () => {
  let consoleStub

  const responseHeader = ({ concurso, data, local, cidade, estado }) => `
  -------------------------------------------------
  Concurso: ${concurso} - ${data}
  Sorteio realizado no ${local} em ${cidade}, ${estado}
  -------------------------------------------------
  `

  const responseAwardsWithWinner = `
  Quina: 15 números acertados 🎉
  1 apostas ganhadoras, R$ 3.927.137,86

  Quadra: 4 números acertados
  83 apostas ganhadoras, R$ 6.012,52

  Terno: 3 números acertados
  7054 apostas ganhadoras, R$ 106,38

  Duque: 2 números acertados
  168524 apostas ganhadoras, R$ 2,44
  `
  const responseAwardsWithoutWinner = `
  ACUMULADO!!

  Quina: 15 números acertados
  Não houve ganhador

  Quadra: 4 números acertados
  65 apostas ganhadoras, R$ 6.910,61

  Terno: 3 números acertados
  5040 apostas ganhadoras, R$ 134,02

  Duque: 2 números acertados
  133790 apostas ganhadoras, R$ 2,77
  `

  const responseFooter = ({ data, valor }) => `
  -------------------------------------------------
  Proximo Sorteio ${data}
  Estimativa de prêmio é R$ ${formatNumber(valor, 2, '.', ',')}
  -------------------------------------------------`

  const parseValue = body => {
    if (typeof body.vrEstimativa === 'string') {
      const value = body.vrEstimativa.replace(/[.,]/g, '')
      body.vrEstimativa = value.slice(0, value.length - 2)
      return body
    }
    return body
  }

  const responseMockAcumulado = {
    'concurso': 4882,
    'ganhadores': 0,
    'ganhadores_quadra': 65,
    'ganhadores_terno': 5040,
    'qt_ganhador_duque': 133790,
    'valor': 0,
    'valor_quadra': 6910.61,
    'valor_terno': 134.02,
    'vr_rateio_duque': 2.77,
    'sorteioAcumulado': true,
    'vrEstimado': 4500000,
    'resultadoOrdenado': '15-48-54-65-66',
    'dataStr': '22/01/2019',
    'dtProximoConcursoStr': '23/01/2019',
    'de_local_sorteio': 'Caminhão da Sorte',
    'no_cidade': 'QUIRINÓPOLIS',
    'sg_uf': 'GO',
    'mensagens': [],
    'error': false
  }
  const responseMock = {
    'concurso': 4877,
    'ganhadores': 1,
    'ganhadores_quadra': 83,
    'ganhadores_terno': 7054,
    'qt_ganhador_duque': 168524,
    'valor': 3927137.86,
    'valor_quadra': 6012.52,
    'valor_terno': 106.38,
    'vr_rateio_duque': 2.44,
    'sorteioAcumulado': false,
    'vrEstimado': 600000,
    'resultadoOrdenado': '04-10-64-71-75',
    'dataStr': '16/01/2019',
    'dtProximoConcursoStr': '17/01/2019',
    'de_local_sorteio': 'Espaço Loterias Caixa',
    'no_cidade': 'SÃO PAULO',
    'sg_uf': 'SP',
    'mensagens': [],
    'error': false
  }

  const paramsHeader = mock => ({
    concurso: mock.concurso,
    data: mock.dataStr,
    local: mock.de_local_sorteio,
    cidade: mock.no_cidade,
    estado: mock.sg_uf
  })

  const paramsFooter = mock => ({
    valor: mock.vrEstimado,
    data: mock.dtProximoConcursoStr
  })

  beforeEach(() => {
    consoleStub = sinon.stub(console, 'info')
  })
  afterEach(() => {
    consoleStub.restore()
  })

  it('should search last lottery', async () => {
    nock('http://loterias.caixa.gov.br')
      .get('/wps/portal/loterias/landing/quina/!ut/p/a1/jc69DoIwAATgZ_EJepS2wFgoaUswsojYxXQyTfgbjM9vNS4Oordd8l1yxJGBuNnfw9XfwjL78dmduIikhYFGA0tzSFZ3tG_6FCmP4BxBpaVhWQuA5RRWlUZlxR6w4r89vkTi1_5E3CfRXcUhD6osEAHA32Dr4gtsfFin44Bgdw9WWSwj/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0VSC0AC4GLFAD20G6/res/id=buscaResultado/c=cacheLevelPage/=/')
      .reply(200, responseMockAcumulado)

    const footer = paramsFooter(parseValue(responseMockAcumulado))
    const header = paramsHeader(responseMockAcumulado)

    await quina({})

    expect(consoleStub).to.have.been.calledWith(responseHeader(header))
    expect(consoleStub).to.have.been.calledWithMatch(responseMockAcumulado.resultadoOrdenado.replace(/-/g, ' '))
    expect(consoleStub).to.have.been.calledWith(responseAwardsWithoutWinner)
    expect(consoleStub).to.have.been.calledWith(responseFooter(footer))
  })

  it('should return the result of a specific search and have a winner', async () => {
    nock('http://loterias.caixa.gov.br')
      .get('/wps/portal/loterias/landing/quina/!ut/p/a1/jc69DoIwAATgZ_EJepS2wFgoaUswsojYxXQyTfgbjM9vNS4Oordd8l1yxJGBuNnfw9XfwjL78dmduIikhYFGA0tzSFZ3tG_6FCmP4BxBpaVhWQuA5RRWlUZlxR6w4r89vkTi1_5E3CfRXcUhD6osEAHA32Dr4gtsfFin44Bgdw9WWSwj/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0VSC0AC4GLFAD20G6/res/id=buscaResultado/c=cacheLevelPage/=/')
      .query({ concurso: 4877 })
      .reply(200, responseMock)

    const header = paramsHeader(responseMock)
    const footer = paramsFooter(parseValue(responseMock))

    await quina({ concurso: 4877 })
    expect(consoleStub).to.have.been.calledWith(responseHeader(header))
    expect(consoleStub).to.have.been.calledWithMatch(responseMock.resultadoOrdenado.replace(/-/g, ' '))
    expect(consoleStub).to.have.been.calledWith(responseAwardsWithWinner)
    expect(consoleStub).to.have.been.calledWith(responseFooter(footer))
  })

  it('should return the result of a specific search', async () => {
    nock('http://loterias.caixa.gov.br')
      .get('/wps/portal/loterias/landing/quina/!ut/p/a1/jc69DoIwAATgZ_EJepS2wFgoaUswsojYxXQyTfgbjM9vNS4Oordd8l1yxJGBuNnfw9XfwjL78dmduIikhYFGA0tzSFZ3tG_6FCmP4BxBpaVhWQuA5RRWlUZlxR6w4r89vkTi1_5E3CfRXcUhD6osEAHA32Dr4gtsfFin44Bgdw9WWSwj/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0VSC0AC4GLFAD20G6/res/id=buscaResultado/c=cacheLevelPage/=/')
      .query({ concurso: 4882 })
      .reply(200, responseMockAcumulado)

    const header = paramsHeader(responseMockAcumulado)
    const footer = paramsFooter(parseValue(responseMockAcumulado))

    await quina({ concurso: 4882 })

    expect(consoleStub).to.have.been.calledWith(responseHeader(header))
    expect(consoleStub).to.have.been.calledWithMatch(responseMockAcumulado.resultadoOrdenado.replace(/-/g, ' '))
    expect(consoleStub).to.have.been.calledWith(responseAwardsWithoutWinner)
    expect(consoleStub).to.have.been.calledWith(responseFooter(footer))
  })
})
