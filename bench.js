const test = require('brittle')

test('get', async (t) => {
  await t.test('native', async (t) => {
    const Bitarray = require('.')

    const b = new Bitarray()
    b.set(1234567)

    const ops = 1e8

    let r

    const elapsed = await t.execution(() => {
      for (let i = 0; i < ops; i++) {
        r = b.get(1234567)
      }
    })

    t.ok(r)

    t.comment(Math.round((ops / elapsed) * 1e3) + ' ops/s')
  })

  await t.test('javascript', async (t) => {
    const Bitarray = require('./fallback')

    const b = new Bitarray()
    b.set(1234567)

    const ops = 1e8

    let r

    const elapsed = await t.execution(() => {
      for (let i = 0; i < ops; i++) {
        r = b.get(1234567)
      }
    })

    t.ok(r)

    t.comment(Math.round((ops / elapsed) * 1e3) + ' ops/s')
  })
})

test('set', async (t) => {
  await t.test('native', async (t) => {
    const Bitarray = require('.')

    const b = new Bitarray()

    const ops = 1e8

    let r

    const elapsed = await t.execution(() => {
      for (let i = 0; i < ops; i++) {
        r = b.set(Math.floor(Math.random() * 1234567))
      }
    })

    t.comment(r)

    t.comment(Math.round((ops / elapsed) * 1e3) + ' ops/s')
  })

  await t.test('javascript', async (t) => {
    const Bitarray = require('./fallback')

    const b = new Bitarray()

    const ops = 1e8

    let r

    const elapsed = await t.execution(() => {
      for (let i = 0; i < ops; i++) {
        r = b.set(Math.floor(Math.random() * 1234567))
      }
    })

    t.comment(r)

    t.comment(Math.round((ops / elapsed) * 1e3) + ' ops/s')
  })
})

test('fill', async (t) => {
  await t.test('native', async (t) => {
    const Bitarray = require('.')

    const b = new Bitarray()

    const ops = 1e6

    const elapsed = await t.execution(() => {
      for (let i = 0; i < ops; i++) {
        b.fill(true, 0, 1234567)
      }
    })

    t.comment(Math.round((ops / elapsed) * 1e3) + ' ops/s')
  })

  await t.test('javascript', async (t) => {
    const Bitarray = require('./fallback')

    const b = new Bitarray()

    const ops = 1e3

    const elapsed = await t.execution(() => {
      for (let i = 0; i < ops; i++) {
        b.fill(true, 0, 1234567)
      }
    })

    t.comment(Math.round((ops / elapsed) * 1e3) + ' ops/s')
  })
})

test('findFirst', async (t) => {
  await t.test('native', async (t) => {
    const Bitarray = require('.')

    const b = new Bitarray()
    b.set(1234567)

    const ops = 1e7

    let r

    const elapsed = await t.execution(() => {
      for (let i = 0; i < ops; i++) {
        r = b.findFirst(true)
      }
    })

    t.is(r, 1234567)

    t.comment(Math.round((ops / elapsed) * 1e3) + ' ops/s')
  })

  await t.test('javascript', async (t) => {
    const Bitarray = require('./fallback')

    const b = new Bitarray()
    b.set(1234567)

    const ops = 1e7

    let r

    const elapsed = await t.execution(() => {
      for (let i = 0; i < ops; i++) {
        r = b.findFirst(true)
      }
    })

    t.is(r, 1234567)

    t.comment(Math.round((ops / elapsed) * 1e3) + ' ops/s')
  })
})
