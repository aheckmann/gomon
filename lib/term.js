
var repl = require('repl')
var vm = require('vm')
var readline = require('readline')
var log = require('./log')
var debug = require('./debug')
var GLOBAL = true; // false?
var term;

module.exports = exports = function (db) {
  // start off with an empty prompt so start up logging/debug msgs
  // are written without interuption
  term = repl.start({
      prompt: ''
    , useGlobal: GLOBAL
    , ignoreUndefined: true
    , eval: eval_
  });

  // overwrite the empty prompt line
  process.stdout.write('\x1b[1A\r\n');

  // listen for CTRL+D etc
  term.on('exit', function () {
    log('\r\nbye')
    db.close(process.exit.bind(process));
  })

  term.bufferStart = function () {
    debug('start buffering')
    animation.start();
  }

  term.bufferEnd = function () {
    debug('end buffering')
    animation.end();
  }

  term.moveCursorToEnd = function () {
    term.rli._moveCursor(+Infinity);
  }

  return term;
}

var animation = (function(){
  // overwrite user input every 20ms
  // change chars every 200ms
  var chars = ['-','\\','|','/']
  var interval = 20;
  var group = 100
  var timer;
  var delay;
  var i = -1;

  function start () {
    delay = setTimeout(function(){
      var char;
      var change = group / interval;
      timer = setInterval((function frame () {
        if (0 === ++i % change) {
          char = chars[i % chars.length];
        }
        readline.clearLine(term.outputStream);
        readline.cursorTo(term.outputStream, 0);
        term.outputStream.write(char);
        return frame;
      })(), interval);
    }, 10);
  }

  function end () {
    // overwrite the empty prompt line
    process.stdout.write('\x1b[1A');
    clearTimeout(delay);
    clearInterval(timer);
    timer = delay = null;
    i = -1;
  }

  return {
      start: start
    , end: end
  }
})();

function eval_ (code, context, file, cb) {
  var err, res;
  try {
    if (GLOBAL) {
      res = vm.runInThisContext(code, file);
    } else {
      res = vm.runInNewContext(code, context, file);
    }
  } catch (e) {
    err = e;
  }
  cb(err, res);
}
