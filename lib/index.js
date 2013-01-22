
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

  // a single connection called `db`
  // global use(name) fn to change dbs
  // global show.collections()
  // global show.dbs()
  // global use.[name] with autocomplete?
  // typing `db` [ENTER] print the current db name

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
    if (err) abort(err);

    console.log('\033[90mconnected\033[0m')

    // if there are files, execute them
    // after all files complete, start up shell
    // connect to db if appropriate
    startShell(db, files);
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

function startShell (db, files) {
  // starts the shell

  var term = repl.start('gomon> ', null, null, true, true);

  createContext(db, term);
  term.displayPrompt()

  // TODO
  // if files exist, exec them, then exit unless --shell exists
  // if no files, just enter shell

  //executeFiles(files, function (err) {

  //})
}

/**
 * Execute the given `files` in the context shared
 * with the shell when started.
 */

function executeFiles (files, next) {
}

/**
 * build a url from command line options
 */
