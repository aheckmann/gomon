var format = require('util').format;

module.exports = exports = /\bgomon\b/.test(process.env.DEBUG || '')
  ? debug
  : function(){}

function debug (fmt) {
  fmt = '\033[90m  ' + fmt + '\033[0m';
  process.stdout.write(format.apply(this, arguments) + '\r\n');
}
