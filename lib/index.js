
/**
 * Module dependencies
 */

var repl = require('repl')
var path = require('path')
var debug = require('debug')('gomon')
var mongo = require('mongodb')
var abort = require('./abort')
var getUrl = require('./url')
var createContext = require('./createContext')

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
    debug('connected')
    startShell(db, program, files);
  })
}

/**
 * Creates a connection to the given `url`.
 */

function connect (url, next) {
  console.log('\033[90mconnecting to \033[32m%s\033[0m', url);
  mongo.Db.connect(url, { db: { w: 1 }}, next);
}

/**
 * Starts up a shell with the given context.
 */

function startShell (db, program, files) {
  var term = repl.start(prompt, null, null, true, true);

  createContext(db, term);
  term.displayPrompt()

  executeFiles(files);

  // if we executed files, exit unless --shell was passed
  if (files.length && !program.shell) {
    process.exit(0);
  }
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
