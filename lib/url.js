/**
 * Dependencies
 */

var url = require('url')
var abort = require('./abort')

/**
 * Parse program arguments to produce a mongodb url
 *
 *     gomon localhost:27017
 *     gomon mongodb://localhost:27017,hostA:27017,hostB/dev
 *     gomon --port 27107
 *     gomon --host localhost --port 27017
 */

module.exports = exports = function (address, program) {
  var host = program.host || 'localhost';
  var port = Number(program.port) || 27017;
  var db = 'test';

  if (address) {
    if (!/\/|:/.test(address)) {
      db = address;
    } else {
      if (!/^mongodb:\/\//.test(address)) {
        address = 'mongodb://' + address;
      }
      var parsedUrl = url.parse(address);
      if (!parsedUrl.auth && !parsedUrl.pathname) {
        address += '/test';
      }
      return address;
    }
  }

  if ('string' != typeof host)
    abort('invalid host');

  if ('number' != typeof port)
    abort('invalid port')

  if ('string' != typeof db)
    abort('invalid db')

  return 'mongodb://' + host + ':' + port + '/' + db;
}
