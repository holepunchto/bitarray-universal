try {
  module.exports = require('bitarray-native')
} catch {
  module.exports = require('./fallback')
}
