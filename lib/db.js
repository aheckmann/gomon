
/**
 * Dependencies
 */

var mongodb = require('mongodb')
var slice = require('sliced')
var log = require('./log')
var p = require('./p')

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
    this.collections();
  }

  /**
   * Drop this database
   *
   * @param {Function} [cb]
   */

  DB.prototype.drop = function (cb) {
    var name = db.databaseName;

    db.dropDatabase(cb || function (err) {
      if (err) {
        return console.error(err);
      }

      db.collections(function () {
        log('database "%s" was dropped', name);
      });
    });
  }

  /**
   * Close this database connection
   *
   * @param {Function} [cb]
   */

  DB.prototype.close = function (cb) {
    if ('function' != typeof cb) {
      cb = handleError;
    }

    db.close.call(db, true, cb);
  }

  /**
   * Use a different database
   */

  DB.prototype.use = function (name) {
    return create(db.db(name));
  }

  /**
   * Access a collection
   */

  DB.prototype.collection = function (name, opts) {
    if (this[name]) {
      return this[name];
    }

    return this[name] = db.collection(name, opts);
  }

  /**
   * console.log helper
   */

  DB.prototype.inspect = function () {
    return db.databaseName;
  }

  /**
   * Refresh and return the list of collections on this database
   */

  DB.prototype.collections = function (cb) {
    var self = this;

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
      });

      if (cb) return cb(err, names);
    });
  }

  /**
   * Execute a command on the database
   *
   * @param {Object} cmd
   * @param {Object} [opts]
   * @param {Function} [cb]
   */

  DB.prototype.runCommand = function (cmd, opts, cb) {
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
  }

  return DB;

}

/**
 * Error reporting helper
 */

function handleError (err) {
  if (err) {
    return console.error(err);
  }
}

/**
 * use.database
 *
 * db.drop()
 * db.close() // cloneDatabase()
 * db.copy()  // copyDatabase()
 * db.help()  // make combination of help() & db.listCommands()
 * db.eval()
 * db.createCollection()
 * db.collection.find()
 * db.collectionNames() // getCollectionNames
 *
 * db.addUser()
 * db.removeUser()
 * db.auth()
 * db.logout()
 * db.changeUserPassword()
 *
 * db.runCommand()
 * db.adminCommand() ?
 *
 * db.repair() // db.repairDatabase()
 * db.killOp()
 * db.currentOp()
 * db.fsyncLock()
 * db.fsyncUnlock()
 *
 * db.stats()
 * db.profilingLevel() // with args is a setter, else getter
 * db.readPref()
 *
 * db.loadServerScripts() // from system.js collection into the shell
 *
 * // belongs on a server object
 * .isMaster()
 * .status()    // .serverStatus()
 * .shutdown()  // .shutdownServer()
 * .hostInfo()
 * .version()
 * .cmdLineOpts // .serverCmdLineOpts()
 *
 * // unclear
 * db.getReplicationInfo()
 * db.printReplicationInfo()
 * db.printShardingStatus()
 * db.printSlaveReplicationInfo()
 * db.getLastErrorCmd()
 * db.getLastErrorObj()
 * db.getPrevError()
 * db.getLastError()
 *
 * // belongs on collections
 * .cloneCollection()
 */

