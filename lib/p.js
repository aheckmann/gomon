
/**
 * Dependencies
 */

var slice = require('sliced')
var util = require('util')

/**
 * print helper
 */

module.exports = exports = function p () {
  console.log();
  slice(arguments).forEach(function (arg, i) {
    var out = util.inspect(arg, false, 100, true);
    global.repl.context._ = arg;
    if (i === 0) {
      console.log('error: ', out);
    } else {
      console.log(out);
    }
  });
  global.repl.displayPrompt();
}
