
var repl = require('repl')
var log = require('./log')

module.exports = exports = function (db) {
  // start off with an empty prompt so start up logging/debug msgs
  // are written without interuption
  var term = repl.start({
      prompt: ''
    , useGlobal: true
    , ignoreUndefined: true
  });

  // overwrite the empty prompt line
  process.stdout.write('\x1b[1A\r\n');

  // listen for CTRL+D etc
  term.on('exit', function () {
    log('\r\nbye')
    db.close(process.exit.bind(process));
  })

  return term;
}
