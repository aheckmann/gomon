var debug = require('./debug');
var log = require('./log')
var p = require('./p')

module.exports = exports = function (db, term, cb) {
  var context = term.context;
  context.db = db;

  context.use = function (name) {
    debug('use db [' + name + ']');
    term.context.db = db = db.use(name);
    term.displayPrompt();
    return db;
  }

  function collections (options, cb) {
    debug('fetching collections');

    if ('function' == typeof options) {
      cb = options;
      options = {};
    } else if (!options) {
      options = {};
    }

    db.cols(function (err, names) {
      if (err) {
        console.error(err.stack);
        return term.displayPrompt();
      }

      if (cb) return cb(err, names);
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
    debug('fetching dbs');

    if (!cb) {
      if ('function' == typeof rich)
        cb = rich, rich = false;
    }

    db.runCommand({ listDatabases: 1 }, { admin: true }, function (err, dbs) {
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
    })
  }

  var show = context.show = {};

  Object.defineProperty(show, 'dbs', {
      get: dbs
  })

  Object.defineProperty(show, 'collections', {
      get: collections
  })

  Object.defineProperty(show, 'tables', {
      get: collections
  })

  Object.defineProperty(context, 'exit', {
      get: function () {
        db.close(function () {
          process.exit()
        })
      }
  });

  /**
   * Query result print helper
   */

  context.p = p;

  // add dbs to the use function for autocomplete
  dbs(function (err, res) {
    if (err) {
      console.error(err.stack);
      term.displayPrompt();
      return cb();
    }

    // assign db name getters on global `use` object
    var dbs = res.documents[0].databases;
    dbs.forEach(function (db) {
      Object.defineProperty(context.use, db.name, {
        get: context.use.bind(context, db.name)
      });
    });

    // TODO refresh database list after dropping a db

    cb();
  });

}
