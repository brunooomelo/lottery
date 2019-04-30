const { expect } = require('chai')
const { exec } = require('child_process')

const lottery = 'node ./bin/lottery'
const pkg = require('../package.json')

describe('Main CLI', () => {
  it('should return version of lottery', done => {
    exec(`${lottery} --version`, (err, stdout) => {
      if (err) throw err
      expect(stdout.replace('\n', '')).to.be.equal(`v${pkg.version}`)
      done()
    })
  })

  it('should return the description when "lottery --help"', done => {
    exec(`${lottery} --help`, (err, stdout) => {
      if (err) throw err
      expect(stdout.includes('Usage: lottery <command> [flags]')).to.be.true
      done()
    })
  })

  it('should return the description when lottery doesn`t receive args', done => {
    exec(`${lottery}`, (err, stdout) => {
      if (err) throw err
      expect(stdout.includes('where <command> is one of:')).to.be.true
      expect(stdout.includes('lottery help <command>  quick help on <command>')).to.be.true
      done()
    })
  })

  it('should return the megasena option when "lottery help megasena"', done => {
    exec(`${lottery} help megasena`, (err, stdout) => {
      if (err) throw err
      expect(stdout.includes('lottery megasena <options>')).to.be.true
      expect(stdout.includes('--concurso, -c  .......... show contest result')).to.be.true
      done()
    })
  })

  it('should return the lotofacil option when "lottery help lotofacil"', done => {
    exec(`${lottery} help lotofacil`, (err, stdout) => {
      if (err) throw err
      expect(stdout.includes('lottery lotofacil <options>')).to.be.true
      expect(stdout.includes('--concurso, -c  .......... show contest result')).to.be.true
      done()
    })
  })

  it('should return the quina option when "lottery help quina"', done => {
    exec(`${lottery} help quina`, (err, stdout) => {
      if (err) throw err
      expect(stdout.includes('lottery quina <options>')).to.be.true
      expect(stdout.includes('--concurso, -c  .......... show contest result')).to.be.true
      done()
    })
  })

  it('should return the error if command doesn`t exist', done => {
    exec(`${lottery} fizzbuzz`, (err, stdout) => {
      if (err) throw err
      expect(stdout.includes('"fizzbuzz" is not a valid command!')).to.be.true
      done()
    })
  })
})
