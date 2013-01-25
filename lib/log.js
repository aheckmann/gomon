var format = require('util').format;

module.exports = exports = function (fmt) {
  fmt = '\033[90m' + fmt + '\033[0m';
  process.stdout.write(format.apply(this, arguments) + '\r\n');
}
