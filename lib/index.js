
/**
 * Module dependencies
 */

var repl = require('repl')
var path = require('path')
var mongo = require('mongodb')
var abort = require('./abort')
var getUrl = require('./url')
var debug = require('./debug')
var log = require('./log')
var createContext = require('./createContext');
var prompt = 'gomon> ';

module.exports = exports = function (program) {
  debug('initializing')

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
    log('connected')
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
  // start off with an empty prompt so start up logging/debug msg
  // are written without interuption
  var term = repl.start(prompt, null, null, true, true);

  // overwrite the empty prompt line
  process.stdout.write('\x1b[1A\r\n');
  //process.stdout.write('\x1b[1A\x1b[0m');

  createContext(db, term, function () {
    executeFiles(files);

    // if we executed files, exit unless --shell was passed
    if (files.length && !program.shell) {
      process.exit(0);
    }

    term.prompt = prompt;
    term.displayPrompt()
  });
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
 * build a url from command line options
 */
