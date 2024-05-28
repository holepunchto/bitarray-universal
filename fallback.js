const quickbit = require('quickbit-universal')

const BITS_PER_PAGE = 32768
const BYTES_PER_PAGE = BITS_PER_PAGE / 8

const BITS_PER_SEGMENT = 2097152
const BYTES_PER_SEGMENT = BITS_PER_SEGMENT / 8
const PAGES_PER_SEGMENT = BITS_PER_SEGMENT / BITS_PER_PAGE

module.exports = exports = class Bitarray {
  constructor () {
    this._segments = new Map()
    this._pages = new Map()

    this._lastSegment = -1
    this._lastPage = -1
  }

  page (i) {
    if (typeof i !== 'number') {
      throw new TypeError(`\`i\` must be a number, received type ${typeof i} (${i})`)
    }

    const page = this._pages.get(i)

    if (page === undefined) return null

    return page.bitfield
  }

  * pages () {
    const n = this._lastPage + 1

    for (let i = 0; i < n; i++) {
      const page = this.page(i)

      if (page) yield [i, page]
    }
  }

  get (bit) {
    if (typeof bit !== 'number') {
      throw new TypeError(`\`bit\` must be a number, received type ${typeof bit} (${bit})`)
    }

    const i = bit & (BITS_PER_PAGE - 1)
    const j = (bit - i) / BITS_PER_PAGE

    const page = this._pages.get(j)

    if (page === undefined) return false

    return page.get(i)
  }

  set (bit, value = true) {
    if (typeof bit !== 'number') {
      throw new TypeError(`\`bit\` must be a number, received type ${typeof bit} (${bit})`)
    }

    if (typeof value !== 'boolean') {
      throw new TypeError(`\`value\` must be a boolean, received type ${typeof value} (${value})`)
    }

    const i = bit & (BITS_PER_PAGE - 1)
    const j = (bit - i) / BITS_PER_PAGE

    let page = this._pages.get(j)

    if (page === undefined) {
      if (!value) return false

      const k = Math.floor(j / PAGES_PER_SEGMENT)

      let segment = this._segments.get(k)

      if (segment === undefined) {
        segment = new BitarraySegment(this, k)
      }

      page = new BitarrayPage(this, segment, j)
    }

    return page.set(i, value)
  }

  unset (bit) {
    return this.set(bit, false)
  }

  fill (value, start = 0, end = -1) {
    if (typeof value !== 'boolean') {
      throw new TypeError(`\`value\` must be a boolean, received type ${typeof value} (${value})`)
    }

    if (typeof start !== 'number') {
      throw new TypeError(`\`start\` must be a number, received type ${typeof start} (${start})`)
    }

    if (typeof end !== 'number') {
      throw new TypeError(`\`end\` must be a number, received type ${typeof end} (${end})`)
    }

    const len = this._lastSegment + 1

    const n = len * BITS_PER_SEGMENT

    if (start < 0) start += n
    if (end < 0) end += n
    if (start < 0 || start >= end) return

    let remaining = end - start

    let i = start & (BITS_PER_SEGMENT - 1)
    let j = (start - i) / BITS_PER_SEGMENT

    while (remaining > 0) {
      const end = Math.min(i + remaining, BITS_PER_SEGMENT)
      const range = end - i

      let segment = this._segments.get(j)

      if (segment === undefined && value) segment = new BitarraySegment(this, j)

      if (segment) segment.fill(value, i, end)

      i = 0
      j++
      remaining -= range
    }
  }

  findFirst (value, pos = 0) {
    if (typeof value !== 'boolean') {
      throw new TypeError(`\`value\` must be a boolean, received type ${typeof value} (${value})`)
    }

    if (typeof pos !== 'number') {
      throw new TypeError(`\`pos\` must be a number, received type ${typeof pos} (${pos})`)
    }

    const len = this._lastSegment + 1

    const n = len * BITS_PER_SEGMENT

    if (pos < 0) pos += n
    if (pos < 0) pos = 0
    if (pos >= n) return value ? -1 : pos

    let i = pos & (BITS_PER_SEGMENT - 1)
    let j = (pos - i) / BITS_PER_SEGMENT

    while (j < len) {
      const segment = this._segments.get(j)

      let offset = -1

      if (segment) offset = segment.findFirst(value, i)
      else if (!value) offset = i

      if (offset !== -1) return j * BITS_PER_SEGMENT + offset

      i = 0
      j++
    }

    return value ? -1 : Math.max(pos, n)
  }

  firstSet (pos) {
    return this.findFirst(true, pos)
  }

  firstUnset (pos) {
    return this.findFirst(false, pos)
  }

  findLast (value, pos = -1) {
    if (typeof value !== 'boolean') {
      throw new TypeError(`\`value\` must be a boolean, received type ${typeof value} (${value})`)
    }

    if (typeof pos !== 'number') {
      throw new TypeError(`\`pos\` must be a number, received type ${typeof pos} (${pos})`)
    }

    const len = this._lastSegment + 1

    const n = len * BITS_PER_SEGMENT

    if (pos < 0) pos += n
    if (pos >= n) pos = value ? n - 1 : pos
    if (pos < 0) return -1

    let i = pos & (BITS_PER_SEGMENT - 1)
    let j = (pos - i) / BITS_PER_SEGMENT

    while (j >= 0) {
      const segment = this._segments.get(j)

      let offset = -1

      if (segment) offset = segment.findLast(value, i)
      else if (!value) offset = i

      if (offset !== -1) return j * BITS_PER_SEGMENT + offset

      i = BITS_PER_SEGMENT - 1
      j--
    }

    return -1
  }

  lastSet (pos) {
    return this.findLast(true, pos)
  }

  lastUnset (pos) {
    return this.findLast(false, pos)
  }

  count (value, start = 0, end = -1) {
    if (typeof value !== 'boolean') {
      throw new TypeError(`\`value\` must be a boolean, received type ${typeof value} (${value})`)
    }

    if (typeof start !== 'number') {
      throw new TypeError(`\`start\` must be a number, received type ${typeof start} (${start})`)
    }

    if (typeof end !== 'number') {
      throw new TypeError(`\`end\` must be a number, received type ${typeof end} (${end})`)
    }

    const len = this._lastSegment + 1

    const n = len * BITS_PER_SEGMENT

    if (start < 0) start += n
    if (end < 0) end += n
    if (start < 0 || start >= end) return 0

    let remaining = end - start

    if (start >= n) return value ? 0 : remaining

    let i = start & (BITS_PER_SEGMENT - 1)
    let j = (start - i) / BITS_PER_SEGMENT

    let c = 0

    while (remaining > 0) {
      const end = Math.min(i + remaining, BITS_PER_SEGMENT)
      const range = end - i

      const segment = this._segments.get(j)

      if (segment) c += segment.count(value, i, end)
      else if (!value) c += range

      i = 0
      j++
      remaining -= range
    }

    return c
  }

  countSet (start, end) {
    return this.count(true, start, end)
  }

  countUnset (start, end) {
    return this.count(false, start, end)
  }
}

class BitarraySegment {
  constructor (bitarray, index) {
    this.bitarray = bitarray
    this.index = index
    this.tree = quickbit.Index.from([], BYTES_PER_SEGMENT)
    this.pages = new Array(PAGES_PER_SEGMENT)

    bitarray._segments.set(index, this)

    if (bitarray._lastSegment === -1 || index > bitarray._lastSegment) {
      bitarray._lastSegment = index
    }
  }

  get offset () {
    return this.index * BYTES_PER_SEGMENT
  }

  fill (value, start, end) {
    let remaining = end - start

    let i = start & (BITS_PER_PAGE - 1)
    let j = (start - i) / BITS_PER_PAGE

    while (remaining > 0) {
      const end = Math.min(i + remaining, BITS_PER_PAGE)
      const range = end - i

      let page = this.pages[j]

      if (page === undefined && value) page = new BitarrayPage(this.bitarray, this, this.index * PAGES_PER_SEGMENT + j)

      if (page) page.fill(value, i, end)

      i = 0
      j++
      remaining -= range
    }
  }

  findFirst (value, pos) {
    pos = this.tree.skipFirst(!value, pos)

    let i = pos & (BITS_PER_PAGE - 1)
    let j = (pos - i) / BITS_PER_PAGE

    while (j < PAGES_PER_SEGMENT) {
      const page = this.pages[j]

      let offset = -1

      if (page) offset = page.findFirst(value, i)
      else if (!value) offset = i

      if (offset !== -1) return j * BITS_PER_PAGE + offset

      i = 0
      j++
    }

    return -1
  }

  findLast (value, pos) {
    pos = this.tree.skipLast(!value, pos)

    let i = pos & (BITS_PER_PAGE - 1)
    let j = (pos - i) / BITS_PER_PAGE

    if (j >= PAGES_PER_SEGMENT) return -1

    while (j >= 0) {
      const page = this.pages[j]

      let offset = -1

      if (page) offset = page.findLast(value, i)
      else if (!value) offset = i

      if (offset !== -1) return j * BITS_PER_PAGE + offset

      i = BITS_PER_PAGE - 1
      j--
    }

    return -1
  }

  count (value, start, end) {
    let remaining = end - start
    let c = 0

    while (remaining > 0) {
      const l = this.findFirst(value, start)
      if (l === -1 || l >= end) return c

      const h = this.findFirst(!value, l + 1)
      if (h === -1 || h >= end) return c + end - l

      c += h - l
      remaining -= h - start
      start = h
    }

    return c
  }
}

class BitarrayPage {
  constructor (bitarray, segment, index) {
    this.bitarray = bitarray
    this.segment = segment
    this.index = index
    this.bitfield = new Uint32Array(BYTES_PER_PAGE / 4)

    segment.pages[index - segment.index * PAGES_PER_SEGMENT] = this

    const chunks = segment.tree.chunks

    const chunk = { field: this.bitfield, offset: this.offset }

    chunks.push(chunk)

    for (let i = chunks.length - 2; i >= 0; i--) {
      const prev = chunks[i]
      if (prev.offset <= chunk.offset) break
      chunks[i] = chunk
      chunks[i + 1] = prev
    }

    bitarray._pages.set(index, this)

    if (bitarray._lastPage === -1 || index > bitarray._lastPage) {
      bitarray._lastPage = index
    }
  }

  get offset () {
    return this.index * BYTES_PER_PAGE - this.segment.offset
  }

  get (bit) {
    return quickbit.get(this.bitfield, bit)
  }

  set (bit, value) {
    if (quickbit.set(this.bitfield, bit, value)) {
      this.segment.tree.update(this.offset * 8 + bit)

      return true
    }

    return false
  }

  fill (value, start, end) {
    const remaining = end - start

    quickbit.fill(this.bitfield, value, start, end)

    let i = Math.floor(start / 128)
    const n = i + Math.ceil(remaining / 128)

    while (i <= n) {
      this.segment.tree.update(this.offset * 8 + i++ * 128)
    }
  }

  findFirst (value, pos) {
    return quickbit.findFirst(this.bitfield, value, pos)
  }

  findLast (value, pos) {
    return quickbit.findLast(this.bitfield, value, pos)
  }
}

exports.constants = {
  BYTES_PER_PAGE
}
