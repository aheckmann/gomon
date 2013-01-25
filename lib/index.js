
/**
 * Module dependencies
 */

var path = require('path')
var vm = require('vm')
var mongo = require('mongodb')
var abort = require('./abort')
var getUrl = require('./url')
var debug = require('./debug')
var log = require('./log')
var term = require('./term')
var createContext = require('./createContext');
var prompt = 'gomon> ';

module.exports = exports = function (program) {
  log('\033[36mgomon\033[0m version %s', require('../package').version);

  var address;
  var files = [];

  program.args.forEach(function (arg) {
    if (/\.js$/.test(arg)) {
      files.push(arg)
    } else {
      address = arg;
    }
  })

  var url = getUrl(address, program);

  connect(url, function (err, db) {
    if (err) return abort(err);
    debug('connected!');
    startShell(db, program, files);
  })
}

/**
 * Creates a connection to the given `url`.
 */

function connect (url, next) {
  log('connecting to %s', url);
  mongo.Db.connect(url, { db: { w: 1 }}, next);
}

/**
 * Starts up a shell with the given context.
 */

function startShell (db, program, files) {
  var repl = term(db);

  createContext(db, repl, function () {
    var code = program.eval;

    if (code) {
      executeJS(code);
      if (!program.shell) {
        repl.emit('exit');
        return;
      }
    }

    if (files.length) {
      executeFiles(files);
      printCloseMsg();
    }

    repl.prompt = prompt;
    repl.displayPrompt()
  });
}

/**
 * Tell users how to shut down script execution
 */

function printCloseMsg () {
  log('------------------------------------------');
  log('  waiting for script to call `exit` ...');
  log('  OR press Ctrl+D to quit immediately');
  log('------------------------------------------');
}

/**
 * Execute the given `files` in the context shared
 * with the shell when started.
 */

function executeFiles (files) {
  var dir = process.cwd();
  files.forEach(function (file) {
    require(dir + '/' + file);
  });
}

/**
 * Executes javascript passed by --eval
 *
 * @param {String} script to evaluate
 */

function executeJS (script) {
  if (!script) return;

  try {
    var ret = vm.runInThisContext(script, '[eval]');
    if ('undefined' != typeof ret) {
      console.log(ret);
    }
  } catch (err) {
    if (!(err instanceof Error)) {
      err = new Error(err);
    }
    console.log(err.stack.split('\n')[0]);
    process.exit(1);
  }
}

/**
 * build a url from command line options
 */
