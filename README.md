# bitarray-universal

Universal wrapper for <https://github.com/holepunchto/libbitarray> with a JavaScript fallback.

```
npm i bitarray-universal
```

## Usage

```js
const Bitarray = require('bitarray-universal')

const b = new Bitarray()

b.set(1234, true)
b.get(1234)
// true
```

## API

#### `const bitarray = new Bitarray()`

#### `bitarray.insert(bitfield[, start])`

#### `bitarray.clear(bitfield[, start])`

#### `bitarray.get(bit)`

#### `bitarray.set(bit[, value])`

#### `bitarray.unset(bit)`

#### `bitarray.fill(value[, start[, end]])`

#### `bitarray.findFirst(value[, position])`

#### `bitarray.firstSet([position])`

#### `bitarray.firstUnsetSet([position])`

#### `bitarray.findLast(value[, position])`

#### `bitarray.lastSet([position])`

#### `bitarray.lastUnset([position])`

#### `bitarray.count(value[, start[, end]])`

#### `bitarray.countSet([start[, end]])`

#### `bitarray.countUnset([start[, end]])`

## License

Apache-2.0
