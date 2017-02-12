const Promise = require('bluebird')
const co = Promise.coroutine
const METHODS = [
  'get',
  'put',
  'del',
  'clear',
  'list',
  'batch',
  'close'
]

exports.wrap = function wrap ({ store }) {
  METHODS.forEach(method => {
    assert(typeof store[method] === 'function', `expected store to have method "${method}"`)
  })

  let closed
  let closing

  const wrapped = {}
  METHODS.forEach(method => {
    // promisify
    wrapped[method] = co(function* (...args) {
      validate(method, args)
      return store[method](...args)
    })
  })

  return wrapped

  function validate (method, args) {
    if (method === 'close') {
      if (closing) throw new Error('already closing')

      closing = true
      return
    }

    if (method === 'put') {
      validateKey(args[0])
      validateValue(args[1])
      return
    }

    if (method === 'batch') {
      assert(args.length === 1, 'expected 1 argument')
      args[0].forEach(op => {
        const { type, key, value } = op
        assert(type === 'put' || type === 'del', 'expected "type" to be "put" or "del"')
        validateKey(key)
        if (op === 'put') {
          validateValue(value)
        }
      })
    }
  }
}

function validateKey (key) {
  assert(typeof key === 'string', 'key should be a string')
}

function validateValue (value) {
  assert(value !== null && value !== undefined, 'value cannot be null or undefined')
  assert(typeof value === 'string' || typeof value === 'object', 'value should be string or a plain javascript object')
}

function assert (statement, err) {
  if (!statement) {
    throw new Error(err || 'assertion failed')
  }
}
