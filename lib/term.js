
/**
 * Dependencies
 */

var repl = require('repl')
var vm = require('vm')
var log = require('./log')
var debug = require('./debug')

/**
 * If we are using global context for scripts
 */

var GLOBAL = true;

/**
 * REPL creator
 */

module.exports = exports = function (db) {
  // start off with an empty prompt so start up logging/debug msgs
  // are written without interuption
  var term = repl.start({
      prompt: ''
    , eval: eval_
    , useGlobal: GLOBAL
    , ignoreUndefined: true
  })

  // overwrite the empty prompt line
  process.stdout.write('\x1b[1A\r\n');

  // listen for CTRL+D etc
  term.on('exit', function () {
    log('\r\nbye')
    db.close(process.exit.bind(process));
  })

  return term;
}

/**
 * custom eval for detecting dynamic collection creation
 */

function eval_ (code, context, file, cb) {
  var err, res;
  try {
    if (GLOBAL) {
      res = vm.runInThisContext(code, file);
    } else {
      res = vm.runInNewContext(code, context, file);
    }
  } catch (e) {
    var attempt = tryHandleCollectionAccess(code, e, context, file);
    if (attempt.failed) {
      err = e;
    } else {
      res = attempt.success;
    }
  }

  return cb
    ? cb(err, res)
    : [err, res]
}

/**
 * Determine if the error is due to accessing a
 * non-existent collection. If so, create the collection
 * and re-execute origina code.
 */

function tryHandleCollectionAccess (code, err, context, file) {
  debug('checking for dynamic collection creation');

  var missing = /Cannot call method '([^']+)' of undefined/.exec(err);
  if (!missing) {
    return { failed: true }
  }

  // check if the method being accessed was on a collection
  var method = missing[1];
  var rgx = new RegExp('\\bdb\\s*\\.([^\\.]+)\\.\\s*' + method + '\\s*\\(')
  var collection = rgx.exec(code);
  if (!collection) {
    debug('dynamic collection was not attempted')
    return { failed: true }
  }

  collection = collection[1].trim();
  debug('creating collection: "' + collection + '"');

  var out = eval_('(db.collection("' + collection +'"))', context, file)
  if (out[0]) {
    debug('collection creation failed', out[0]);
    return { failed: true }
  }

  // we created the collection, re-execute the original code
  debug('re-attempting original code..')
  var out = eval_(code, context, file)
  if (out[0]) {
    debug('re-attempt failed', out[0]);
    return { failed: true }
  }

  return { success: out[1] }
}

