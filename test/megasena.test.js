const chai = require('chai')
const nock = require('nock')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const expect = chai.expect
chai.use(sinonChai)

const megasena = require('../src/cmd/megasena')

describe('MegaSena', () => {
  let consoleStub
  const responseTemplateAcumulado = `
  -------------------------------------------------
  Concurso: 2112 - 05/01/2019
  Sorteio realizado Caminhão da Sorte em CAIBI, SC
  -------------------------------------------------

  17 39 43 46 52 53

  ACUMULADO!!

  Quina: 5 números acertados
  34 apostas ganhadoras, R$ 48.935,85

  Quadra: 4 números acertados
  2547 apostas ganhadoras, R$ 933,20

  -------------------------------------------------
  Proximo Sorteio 09/01/2019
  Estimativa de prêmio é R$ 8.000.000,00
  -------------------------------------------------
  `

  const responseMockAcumulado = {
    "concurso": 2112,
    "ganhadores": 0,
    "ganhadores_quina": 34,
    "ganhadores_quadra": 2547,
    "valor": 0.00,
    "valor_quina": 48935.85,
    "valor_quadra": 933.20,
    "acumulado": 1,
    "valor_acumulado": 4312684.25,
    "vr_estimativa": 8000000.00,
    "resultadoOrdenado": "17-39-43-46-52-53",
    "dataStr": "05/01/2019",
    "dt_proximo_concursoStr": "09/01/2019",
    "de_local_sorteio": "Caminhão da Sorte",
    "no_cidade": "CAIBI",
    "sg_uf": "SC",
  }

  beforeEach(() => {
    consoleStub = sinon.stub(console, 'info');
  })
  afterEach(() => {
    consoleStub.restore()
  })

  it('should search last lottery ', async () => {
    nock('http://loterias.caixa.gov.br')
    .get('/wps/portal/loterias/landing/megasena/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA0sjIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wNnUwNHfxcnSwBgIDUyhCvA5EawAjxsKckMjDDI9FQE-F4ca/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO6H80AU71KG7J0072/res/id=buscaResultado/c=cacheLevelPage/=/')
    .reply(200, responseMockAcumulado)

    await megasena({})
    expect(consoleStub).to.have.been.calledWith(responseTemplateAcumulado)
  })
})



