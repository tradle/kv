const co = require('bluebird').coroutine
const METHODS = [
  'get',
  'put',
  'del',
  'clear',
  'list',
  'batch'
]

exports.wrap = function wrap ({ store }) {
  METHODS.forEach(method => {
    assert(typeof store[method] === 'function', `expected store to have method "${method}"`)
  })

  const wrapped = {}
  METHODS.forEach(method => {
    // promisify
    wrapped[method] = co(function* (...args) {
      return store[method](...args)
    })
  })

  return wrapped
}

exports.default = require('./lowdb')
