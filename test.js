
const path = require('path')
const rimraf = require('rimraf')
const test = require('tape')
const Promise = require('bluebird')
const co = Promise.coroutine
const { wrap } = require('./')
const testDBPath = path.resolve(__dirname, './teststore')

module.exports = function testStore ({ create }) {
  cleanup()
  test('put, get, list, delete', co(function* (t) {
    let store = newStore(create)
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

    yield store.close()
    try {
      yield store.get(bill)
      t.fail('store should be closed')
    } catch (err) {
    }

    // close, reopen
    store = newStore(create)
    t.same(yield store.list(), [])
    yield store.close()

    t.end()
    cleanup()
  }))

  test('batch', co(function* (t) {
    let store = newStore(create)
    const a = { some: 'object' }
    yield store.put('a', a)
    const batch = [
      { type: 'del', key: 'a' },
      { type: 'put', key: 'b', value: '2' },
      { type: 'put', key: 'c', value: '3' },
    ]

    yield store.batch(batch)
    const results = yield store.list()
    t.same(results, [
      { key: 'b', value: '2' },
      { key: 'c', value: '3' },
    ])

    yield store.close()
    t.end()
    cleanup()
  }))
}

function cleanup () {
  rimraf.sync(testDBPath)
}

function newStore (create) {
  return create({
    path: testDBPath
  })

  // return wrap({
  //   store: create({
  //     path: testDBPath
  //   })
  // })
}
