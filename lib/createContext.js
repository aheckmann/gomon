var debug = require('./debug');
var log = require('./log')

module.exports = exports = function (db, term, cb) {
  var context = term.context;

  // TODO move me
  db.constructor.prototype.inspect = function () {
    return this.databaseName;
  }

  context.db = db;

  context.use = function (name) {
    debug('use db [' + name + ']');

    if (Array.isArray(db.__collections__)) {
      db.__collections__.forEach(function (name) {
        delete db[name];
      });
    }
    term.context.db = db = db.db(name);
    collections({ silent: true });
    term.displayPrompt();
    return db;
  }

  function collections (options, cb) {
    debug('listing collections');

    if ('function' == typeof options) {
      cb = options;
      options = {};
    } else if (!options) {
      options = {};
    }

    db.collectionNames({ namesOnly: true }, function (err, names) {
      if (!Array.isArray(names)) {
        names = []
      }

      // strip db from name
      var ns = db.databaseName;
      var len = ns.length + 1;
      names = names.map(function (name) {
        return name.substring(len);
      });

      db.__collections__ = names;

      // expose access from db
      names.forEach(function (name) {
        db[name] = db.collection(name);
      });

      if (cb) return cb(err, names);

      if (err) {
        console.error(err.stack);
        return term.displayPrompt();
      }

      if (!names.length) return;
      if (options.silent) return;

      log();
      names.forEach(function (name) {
        log(name);
      })

      term.displayPrompt();
    });
  }

  function dbs (rich, cb) {
    debug('listing dbs');

    if (!cb) {
      if ('function' == typeof rich)
        cb = rich, rich = false;
    }

    db.executeDbAdminCommand({ listDatabases: 1 }, {}, function (err, dbs) {
      if (cb) return cb(err, dbs);
      if (err) {
        console.error(err.stack);
        return term.displayPrompt();
      }

      dbs = dbs.documents[0].databases;

      if (rich) {
        log(dbs);
      } else {

        var width = 10;
        var size = {};

        dbs.forEach(function (x) {
          size[x.name] = x.sizeOnDisk;
        });

        var names = dbs.map(function (z) {
          width = Math.max(z.name.length + 3, width);
          return z.name;
        }).sort();

        log();
        names.forEach(function (n) {
          var padding = new Array(width - n.length).join(' ');
          if (size[n] > 1) {
            log(n + padding + size[n] / 1024 / 1024 / 1024 + "GB");
          } else {
            log(n + padding + "(empty)");
          }
        });
      }
      term.displayPrompt();
    });
  }

  var show = context.show = {};
  Object.defineProperty(show, 'dbs', {
      get: dbs
  })
  Object.defineProperty(show, 'collections', {
      get: collections
  })

  Object.defineProperty(context, 'exit', {
      get: function () {
        db.close(function () {
          process.exit()
        })
      }
  });

  // add dbs to the use function for autocomplete
  dbs(function (err, res) {
    if (err) {
      console.error(err.stack);
      term.displayPrompt();
      return;
    }
    var dbs = res.documents[0].databases;
    dbs.forEach(function (db) {
      Object.defineProperty(context.use, db.name, {
        get: context.use.bind(context, db.name)
      });
    });

    cb();
  });

}
