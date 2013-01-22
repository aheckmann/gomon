module.exports = exports = function (msg) {
  console.error(msg && msg.stack || msg);
  'undefined' != typeof db && db.close();
  process.exit(1);
}
