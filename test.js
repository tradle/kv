
const test = require('tape')
const Promise = require('bluebird')
const co = Promise.coroutine
const { wrap } = require('./')

module.exports = function (implementation) {
  const store = wrap(implementation)
  const test = require('tape')
  test('put, get, list, delete', co(function* (t) {
    const bill = 'bill'
    const billInfo = { lastName: 'preston' }
    yield store.put(bill, billInfo)
    t.same(yield store.get(bill), billInfo)

    const ted = 'ted'
    const tedInfo = { lastName: 'logan' }
    store.put(ted, tedInfo)
    t.same(yield store.get(ted), tedInfo)
    t.same(yield store.list(), [
      { key: bill, value: billInfo },
      { key: ted, value: tedInfo }
    ])

    yield store.del(bill)
    try {
      yield store.get(bill)
      t.fail('item should have been deleted')
    } catch (err) {
    }

    yield store.clear()
    t.same(yield store.list(), [])
  }))
}
