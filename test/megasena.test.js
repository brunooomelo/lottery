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

  const responseTemplate = `
  -------------------------------------------------
  Concurso: 2110 - 05/01/2019
  Sorteio realizado Caminhão da Sorte em CAIBI, SC
  -------------------------------------------------

  17 39 43 46 52 53

  Sena: 6 números acertados 🎉
  13 apostas ganhadoras, R$ 5.818.007,36

  Quina: 5 números acertados
  34 apostas ganhadoras, R$ 48.935,85

  Quadra: 4 números acertados
  2547 apostas ganhadoras, R$ 933,20

  -------------------------------------------------
  Proximo Sorteio 09/01/2019
  Estimativa de prêmio é R$ 8.000.000,00
  -------------------------------------------------
  `

  const responseTemplateError = `
  ⚠ Concurso inexistente. Por favor, confira numeração digitada
  `

  const responseMockAcumulado = {
    "concurso": 2112,
    "ganhadores": 0,
    "ganhadores_quina": 34,
    "ganhadores_quadra": 2547,
    "valor": 5818007.36,
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
    "mensagens": []
  }
  const responseMock = {
    "concurso": 2110,
    "ganhadores": 13,
    "ganhadores_quina": 34,
    "ganhadores_quadra": 2547,
    "valor": 5818007.36,
    "valor_quina": 48935.85,
    "valor_quadra": 933.20,
    "acumulado": 0,
    "valor_acumulado": 4312684.25,
    "vr_estimativa": 8000000.00,
    "resultadoOrdenado": "17-39-43-46-52-53",
    "dataStr": "05/01/2019",
    "dt_proximo_concursoStr": "09/01/2019",
    "de_local_sorteio": "Caminhão da Sorte",
    "no_cidade": "CAIBI",
    "sg_uf": "SC",
    "mensagens": []
  }

  const responseMockError = {
    "mensagens": [
      "Concurso inexistente. Por favor, confira numeração digitada"
    ],
  }

  beforeEach(() => {
    consoleStub = sinon.stub(console, 'info');
  })
  afterEach(() => {
    consoleStub.restore()
  })

  it('should search last lottery', async () => {
    nock('http://loterias.caixa.gov.br')
    .get('/wps/portal/loterias/landing/megasena/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA0sjIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wNnUwNHfxcnSwBgIDUyhCvA5EawAjxsKckMjDDI9FQE-F4ca/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO6H80AU71KG7J0072/res/id=buscaResultado/c=cacheLevelPage/=/')
    .reply(200, responseMockAcumulado)

    await megasena({})
    expect(consoleStub).to.have.been.calledWith(responseTemplateAcumulado)
  })

  it('should return the result of a specific search and have a winner', async () => {
    nock('http://loterias.caixa.gov.br')
    .get('/wps/portal/loterias/landing/megasena/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA0sjIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wNnUwNHfxcnSwBgIDUyhCvA5EawAjxsKckMjDDI9FQE-F4ca/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO6H80AU71KG7J0072/res/id=buscaResultado/c=cacheLevelPage/=/')
    .query({ concurso: 2110 })
    .reply(200, responseMock)

    await megasena({ concurso: 2110 })
    expect(consoleStub).to.have.been.calledWith(responseTemplate)
  })
  it('should return the result of a specific search', async () => {
    nock('http://loterias.caixa.gov.br')
    .get('/wps/portal/loterias/landing/megasena/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA0sjIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wNnUwNHfxcnSwBgIDUyhCvA5EawAjxsKckMjDDI9FQE-F4ca/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO6H80AU71KG7J0072/res/id=buscaResultado/c=cacheLevelPage/=/')
    .query({ concurso: 2112 })
    .reply(200, responseMockAcumulado)

    await megasena({ concurso: 2112 })
    expect(consoleStub).to.have.been.calledWith(responseTemplateAcumulado)
  })

  it('should return an error if contest doesn`t exist', async () => {
    nock('http://loterias.caixa.gov.br')
    .get('/wps/portal/loterias/landing/megasena/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA0sjIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wNnUwNHfxcnSwBgIDUyhCvA5EawAjxsKckMjDDI9FQE-F4ca/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO6H80AU71KG7J0072/res/id=buscaResultado/c=cacheLevelPage/=/')
    .query({ concurso: 9999 })
    .reply(200, responseMockError)

    await megasena({ concurso: 9999 })
    expect(consoleStub).to.be.calledWith(responseTemplateError)
  })
})



