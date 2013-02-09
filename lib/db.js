
/**
 * Dependencies
 */

var mongodb = require('mongodb')
var slice = require('sliced')
var log = require('./log')
var p = require('./p')
var noop = function(){}

/**
 * Expose
 */

module.exports = exports = create;

function create (db) {
  var DB = createConstructor(db);
  return new DB;
}

/**
 * We create DB constructors dynamically to avoid
 * assigning the db or collections directly to the
 * database instance, thereby avoiding them displaying
 * in autocomplete mixed together with the collection
 * names.
 *
 * @param {Database} db
 * @return {Function}
 */

function createConstructor (db) {
  var collections = [];

  function DB () {
    this.cols(false, noop);
  }

  /**
   * Logs help text for all db methods
   */

  ;(DB.prototype.help = function () {
    var proto = this.constructor.prototype;
    var len = 0;
    var msgs = [];
    Object.keys(proto).forEach(function (method) {
      if (proto[method].help) {
        var msg = proto[method].help(true);
        len = Math.max(len, method.length);
        msgs.push({ method: method, text: msg })
      }
    })
    msgs.sort(function (a, b) {
      return a.method > b.method ?  1 :
             a.method < b.method ? -1 :
             0
    })
    msgs.forEach(function (msg) {
      var space =  Array(len - msg.method.length +1).join(' ');
      log("db." + msg.method + "() " + space + msg.text);
    })
  }).help = help("Logs help text for all db methods");

  /**
   * Drop this database
   *
   * @param {Function} [cb]
   */

  ;(DB.prototype.drop = function (cb) {
    var name = db.databaseName;

    db.dropDatabase(cb || function (err) {
      if (err) {
        return console.error(err);
      }

      db.collections(function () {
        log('database "%s" was dropped', name);
      });
    });
  }).help = help("Drops the database");
  wrap(DB.prototype, 'drop');

  /**
   * Close this database connection
   *
   * @param {Function} [cb]
   */

  ;(DB.prototype.close = function (cb) {
    if ('function' != typeof cb) {
      cb = handleError;
    }

    db.close(true, cb);
  }).help = help("Closes the database connection");
  wrap(DB.prototype, 'close');

  /**
   * Open the database connection
   *
   * @param {Function} [cb]
   */

  ;(DB.prototype.open = function (cb) {
    db.open(function (err) {
      if (err) {
        return handleError(err, cb);
      }

      if ('function' == typeof cb) {
        cb();
      }
    });
  }).help = help("Opens the database connection")
  wrap(DB.prototype, 'open');

  /**
   * Use a different database
   */

  ;(DB.prototype.use = function (name) {
    return create(db.db(name));
  }).help = help("Changes to a different database")

  /**
   * Access a collection
   */

  ;(DB.prototype.col = function (name, opts) {
    if (this[name]) {
      return this[name];
    }

    // accessor management
    collections.push(name);

    return this[name] = db.collection(name, opts);
  }).help = help("Accesses a collection")

  /**
   * Creates a collection
   *
   * @param {String} name
   * @param {Object} [options]
   * @param {Function} [cb]
   */

  ;(DB.prototype.createCol = function (name, opts, cb) {
    if ('function' == typeof opts) {
      cb = opts;
      opts = {};
    }

    if ('string' != typeof name) {
      error(new TypeError('collection name must be a string'));
      return;
    }

    if (!opts) opts = {};

    // force error if collection exists
    if (!('strict' in opts)) opts.strict = true;

    var self = this;
    db.createCollection(name, opts, function (err, col) {
      if (err) {
        if (/already exists/.test(err)) {
          // remove the "safe mode" message
          err.message = 'collection "' + name + '" already exists';
        }
        return handleError(err);
      }

      // register name for accessor management
      collections.push(name);

      return self[name] = col;
    });

  }).help = help("Creates a collection")
  wrap(DB.prototype, 'createCol');

  /**
   * Refresh and return the list of collections on this database
   *
   * @param {Boolean} [print] if the collection names should be printed
   * @param {Function} [cb] passed any error and the result array
   */

  ;(DB.prototype.cols = function (print, cb) {
    var self = this;

    if ('function' == typeof print) {
      cb = print;
      print = false;
    }

    if (undefined == print) print = true

    db.collectionNames({ namesOnly: true }, function (err, names) {
      if (err) {
        if (cb) return cb(err);
        console.error(err.stack);
        return;
      }

      if (!Array.isArray(names)) {
        names = [];
      }

      // remove cached collections
      collections.forEach(function (name) {
        delete self[name];
      });

      // strip db from name
      var ns = db.databaseName;
      var len = ns.length + 1;
      names = names.map(function (name) {
        return name.substring(len);
      });

      collections = names;

      // expose collection access from `db`
      // TODO abstract collection
      names.forEach(function (name) {
        self[name] = db.collection(name);

        // handle system.indexes etc
        if (/\./.test(name)) {
          var parts = name.split('.');
          parts.reduce(function (out, part, i) {
            if (i == parts.length - 1) {
              out[part] = self[name];
            } else {
              if (!out[part]) {
                out[part] = {};
              }
            }
            return out[part];
          }, self);
        }
      });

      if (cb) return cb(err, names);

      if (print) {
        console.log();
        names.forEach(function (name) {
          log(name);
        })
        global.repl.displayPrompt();
      }
    });
  }).help = help("Retreives an array of collection names in the db")
  wrap(DB.prototype, 'cols');

  /**
   * Execute a command on the database
   *
   * @param {Object} cmd
   * @param {Object} [opts]
   * @param {Function} [cb]
   */

  ;(DB.prototype.runCommand = function (cmd, opts, cb) {
    if ('function' == typeof opts) {
      cb = opts;
      opts = {};
    }

    if (!cmd) {
      var err = new Error('missing command');
      if (cb) return cb(err);
      console.error(err);
      return;
    }

    if (!cb) cb = p;
    if (!opts) opts = {};

    var admin = !! opts.admin;
    delete opts.admin;

    var method = admin
      ? 'executeDbAdminCommand'
      : 'executeDbCommand'

    db[method](cmd, opts, cb);
  }).help = help("Runs a command on the database")
  wrap(DB.prototype, 'runCommand');

  /**
   * Retreive database stats
   */

  ;(DB.prototype.stats = function (scale, cb) {
    if ('function' == typeof scale) cb = scale;
    scale |= 0;

    db.stats(function (err, stats) {
      cb(err, stats);
    })
  }).help = help('Retreive database stats');
  wrap(DB.prototype, 'stats');

  /**
   * console.log helper
   */

  ;(DB.prototype.inspect = function () {
    return db.databaseName;
  }).help = help("Returns the name of the database");

  return DB;

}

/**
 * Wrap async functions with animation etc
 */

function wrap (proto, name) {
  var old = proto[name];

  proto[name] = function () {
    if (global.repl) global.repl.bufferStart();
    var args = slice(arguments);
    var last = args[args.length-1];
    if ('function' == typeof last) {
      args[args.length-1] = function () {
        if (global.repl) global.repl.bufferEnd()
        if (p != last) console.log();
        last.apply(null, arguments)
        if (global.repl) {
          global.repl.displayPrompt();
          global.repl.moveCursorToEnd();
        }
      }
    } else {
      args.push(function () {
        if (global.repl) global.repl.bufferEnd()
        p.apply(null, arguments);
        if (global.repl) global.repl.moveCursorToEnd();
      });
    }
    old.apply(this, args);
  }

  if (old.help) {
    proto[name].help = old.help;
  }
}

/**
 * Error reporting helper
 */

function handleError (err, cb) {
  if (err) {
    if (cb) {
      return process.nextTick(function(){
        cb(err);
      });
    }
    console.error(err);
  }
}

/**
 * help genereator
 */

function help (msg) {
  return function (inline) {
    if (inline) return msg;
    log(msg);
  }
}

/**
 * use.database
 *
 * [x] db.drop()
 * [ ] db.clone() // cloneDatabase()
 * [ ] db.copy()  // copyDatabase()
 * [x] db.open()
 * [x] db.close()
 * [x] db.use()
 * [x] db.help()  // make combination of help() & db.listCommands()
 * [ ] db.eval()
 * [x] db.createCollection()
 * [x] db.collectionNames() // getCollectionNames
 * [ ] db.collection.find()
 *
 * [ ] db.addUser()
 * [ ] db.removeUser()
 * [ ] db.auth()
 * [ ] db.logout()
 * [ ] db.changeUserPassword()
 *
 * [x] db.runCommand()
 * [~] db.adminCommand()
 *
 * [ ] db.repair() // db.repairDatabase()
 *
 * [ ] db.stats()
 * [ ] db.profilingLevel() // with args is a setter, else getter
 * [ ] db.readPref()
 *
 * [ ] db.loadServerScripts() // from system.js collection into the shell
 *
 * // belongs on a server object
 * [ ] server.isMaster()
 * [ ] .status()    // .serverStatus()
 * [ ] .shutdown()  // .shutdownServer()
 * [ ] .hostInfo()
 * [ ] .version()
 * [ ] .cmdLineOpts // .serverCmdLineOpts()
 * [ ] .killOp()
 * [ ] .currentOp() * // should filter by this db
 * [ ] .fsyncLock()
 * [ ] .fsyncUnlock()
 *
 * // rs
 * [ ] .status()
 * [?] .replicationInfo()
 * [?] .slaveReplicationInfo()
 *
 * // sh
 * [ ] .status()
 *
 * // unclear
 * [👎 ] db.getLastErrorCmd()
 * [👎 ] db.getLastErrorObj()
 * [👎 ] db.getPrevError()
 * [👎 ] db.getLastError()
 *
 * // belongs on collections
 * [ ] .cloneCollection()
 * [ ] .currentOp() * filtered
 */

