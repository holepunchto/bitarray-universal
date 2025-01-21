const test = require('brittle')
const Bitarray = require('./fallback')

test('get and set', (t) => {
  const b = new Bitarray()

  t.is(b.get(100000), false)
  t.is(b.set(100000, true), true)
  t.is(b.get(100000), true)
})

test('random set and get', (t) => {
  const b = new Bitarray()
  const set = new Set()

  for (let i = 0; i < 2000; i++) {
    const idx = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    b.set(idx, true)
    set.add(idx)
  }

  for (let i = 0; i < 5000; i++) {
    const idx = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    const expected = set.has(idx)
    const val = b.get(idx)
    if (val !== expected) {
      t.fail('expected ' + expected + ' but got ' + val + ' at ' + idx)
      return
    }
  }

  for (const idx of set) {
    const val = b.get(idx)
    if (val !== true) {
      t.fail('expected true but got ' + val + ' at ' + idx)
      return
    }
  }

  t.pass()
})

test('setBatch', (t) => {
  const b = new Bitarray()

  t.is(b.setBatch([1, 4, 8], true), true)
  t.is(b.get(1), true)
  t.is(b.get(4), true)
  t.is(b.get(8), true)
})

test('count', (t) => {
  const b = new Bitarray()

  for (const [start, length] of [
    [0, 2],
    [5, 1],
    [7, 2],
    [13, 1],
    [16, 3],
    [20, 5]
  ]) {
    b.fill(true, start, start + length)
  }

  t.is(b.count(true, 3, 21), 8)
  t.is(b.count(false, 3, 21), 10)
})

test('find first, all zeroes', (t) => {
  const b = new Bitarray()

  t.is(b.findFirst(false, 0), 0)
  t.is(b.findFirst(true, 0), -1)

  t.comment('Page boundaries')
  t.is(b.findFirst(false, 2 ** 15), 2 ** 15)
  t.is(b.findFirst(false, 2 ** 15 - 1), 2 ** 15 - 1)
  t.is(b.findFirst(false, 2 ** 15 + 1), 2 ** 15 + 1)
  t.is(b.findFirst(false, 2 ** 16), 2 ** 16)
  t.is(b.findFirst(false, 2 ** 16 - 1), 2 ** 16 - 1)
  t.is(b.findFirst(false, 2 ** 16 + 1), 2 ** 16 + 1)

  t.comment('Segment boundaries')
  t.is(b.findFirst(false, 2 ** 21), 2 ** 21)
  t.is(b.findFirst(false, 2 ** 21 - 1), 2 ** 21 - 1)
  t.is(b.findFirst(false, 2 ** 21 + 1), 2 ** 21 + 1)
  t.is(b.findFirst(false, 2 ** 22), 2 ** 22)
  t.is(b.findFirst(false, 2 ** 22 - 1), 2 ** 22 - 1)
  t.is(b.findFirst(false, 2 ** 22 + 1), 2 ** 22 + 1)
})

test('find first, all ones', (t) => {
  const b = new Bitarray()

  b.fill(true, 0, 2 ** 24)

  t.is(b.findFirst(true, 0), 0)
  t.is(b.findFirst(true, 2 ** 24), -1)
  t.is(b.findFirst(false, 0), 2 ** 24)
  t.is(b.findFirst(false, 2 ** 24), 2 ** 24)

  t.comment('Page boundaries')
  t.is(b.findFirst(true, 2 ** 15), 2 ** 15)
  t.is(b.findFirst(true, 2 ** 15 - 1), 2 ** 15 - 1)
  t.is(b.findFirst(true, 2 ** 15 + 1), 2 ** 15 + 1)
  t.is(b.findFirst(true, 2 ** 16), 2 ** 16)
  t.is(b.findFirst(true, 2 ** 16 - 1), 2 ** 16 - 1)
  t.is(b.findFirst(true, 2 ** 16 + 1), 2 ** 16 + 1)

  t.comment('Segment boundaries')
  t.is(b.findFirst(true, 2 ** 21), 2 ** 21)
  t.is(b.findFirst(true, 2 ** 21 - 1), 2 ** 21 - 1)
  t.is(b.findFirst(true, 2 ** 21 + 1), 2 ** 21 + 1)
  t.is(b.findFirst(true, 2 ** 22), 2 ** 22)
  t.is(b.findFirst(true, 2 ** 22 - 1), 2 ** 22 - 1)
  t.is(b.findFirst(true, 2 ** 22 + 1), 2 ** 22 + 1)
})

test('find last, all zeroes', (t) => {
  const b = new Bitarray()

  t.is(b.findLast(false, 0), 0)
  t.is(b.findLast(true, 0), -1)

  t.comment('Page boundaries')
  t.is(b.findLast(false, 2 ** 15), 2 ** 15)
  t.is(b.findLast(false, 2 ** 15 - 1), 2 ** 15 - 1)
  t.is(b.findLast(false, 2 ** 15 + 1), 2 ** 15 + 1)
  t.is(b.findLast(false, 2 ** 16), 2 ** 16)
  t.is(b.findLast(false, 2 ** 16 - 1), 2 ** 16 - 1)
  t.is(b.findLast(false, 2 ** 16 + 1), 2 ** 16 + 1)

  t.comment('Segment boundaries')
  t.is(b.findLast(false, 2 ** 21), 2 ** 21)
  t.is(b.findLast(false, 2 ** 21 - 1), 2 ** 21 - 1)
  t.is(b.findLast(false, 2 ** 21 + 1), 2 ** 21 + 1)
  t.is(b.findLast(false, 2 ** 22), 2 ** 22)
  t.is(b.findLast(false, 2 ** 22 - 1), 2 ** 22 - 1)
  t.is(b.findLast(false, 2 ** 22 + 1), 2 ** 22 + 1)
})

test('find last, all ones', (t) => {
  const b = new Bitarray()

  b.fill(true, 0, 2 ** 24)

  t.is(b.findLast(false, 0), -1)
  t.is(b.findLast(false, 2 ** 24), 2 ** 24)
  t.is(b.findLast(true, 0), 0)
  t.is(b.findLast(true, 2 ** 24), 2 ** 24 - 1)

  t.comment('Page boundaries')
  t.is(b.findLast(true, 2 ** 15), 2 ** 15)
  t.is(b.findLast(true, 2 ** 15 - 1), 2 ** 15 - 1)
  t.is(b.findLast(true, 2 ** 15 + 1), 2 ** 15 + 1)
  t.is(b.findLast(true, 2 ** 16), 2 ** 16)
  t.is(b.findLast(true, 2 ** 16 - 1), 2 ** 16 - 1)
  t.is(b.findLast(true, 2 ** 16 + 1), 2 ** 16 + 1)

  t.comment('Segment boundaries')
  t.is(b.findLast(true, 2 ** 21), 2 ** 21)
  t.is(b.findLast(true, 2 ** 21 - 1), 2 ** 21 - 1)
  t.is(b.findLast(true, 2 ** 21 + 1), 2 ** 21 + 1)
  t.is(b.findLast(true, 2 ** 22), 2 ** 22)
  t.is(b.findLast(true, 2 ** 22 - 1), 2 ** 22 - 1)
  t.is(b.findLast(true, 2 ** 22 + 1), 2 ** 22 + 1)
})

test('find first, ones around page boundary', function (t) {
  const b = new Bitarray()

  b.set(32766, true)
  t.is(b.findFirst(false, 32766), 32767)

  b.set(32767, true)
  t.is(b.findFirst(false, 32766), 32768)
  t.is(b.findFirst(false, 32767), 32768)
})

test('find first, ones around segment boundary', (t) => {
  const b = new Bitarray()

  b.set(2097150, true)
  t.is(b.findFirst(false, 2097150), 2097151)

  b.set(2097151, true)
  t.is(b.findFirst(false, 2097150), 2097152)
  t.is(b.findFirst(false, 2097151), 2097152)
})

test('find last, ones around page boundary', (t) => {
  const b = new Bitarray()

  b.set(32767, true)
  t.is(b.findLast(false, 32767), 32766)

  b.set(32768, true)
  t.is(b.findLast(false, 32768), 32766)
  t.is(b.findLast(false, 32769), 32769)
})

test('find last, ones around segment boundary', (t) => {
  const b = new Bitarray()

  b.set(2097151, true)
  t.is(b.findLast(false, 2097151), 2097150)

  b.set(2097152, true)
  t.is(b.findLast(false, 2097152), 2097150)
  t.is(b.findLast(false, 2097153), 2097153)
})

test('insert', (t) => {
  const b = new Bitarray()

  b.insert(Buffer.from([0b1111]), 16)

  const expected = new Uint32Array(Bitarray.constants.BYTES_PER_PAGE / 4)

  expected[0] = 0b1111_00000000_00000000

  t.alike(b.page(0), expected)
})
