
/**
 * Module dependencies
 */

var program = new (require('commander')).Command('gomon')

program
  .version(require('../package').version)
  .usage('[options] [mongo URI] [file names]')
  .option('--port <port>', 'port to connect to')
  .option('--host <host>', 'server to connect to')
  .option('--shell', 'run the shell after executing files')
  //.option('--norc', 'will not run the ".mongorc.js" file on start up')
  //.option('--quiet', 'be less chatty')
  //.option('--eval <code>', 'evaluate javascript')
  //.option('-u --username <name>', 'username for authentication')
  //.option('-p --password <pwd>', 'password for authentication')
  //.option('--verbose', 'increase verbosity')
  //.option('--ipv6', 'enable IPv6 support (disabled by default)')

program.on('--help', function () {
  console.log('  db address:')
  console.log('    foo                     foo database on local machine')
  console.log('    192.169.0.5/foo         foo database on 192.168.0.5 machine')
  console.log('    192.169.0.5:9999/foo    foo database on 192.168.0.5 machine on port 9999');
  console.log('    mongodb://host:port/db  mongo URI')

  console.log();
  console.log('  file names:')
  console.log('    List of space delimited files (ending in .js) to execute.')
  console.log('    When passed, the shell exits after execution unless --shell')
  console.log('    is specified.');

  console.log();
})

program.parse(process.argv);

require('../lib/')(program);
