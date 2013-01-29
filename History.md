
0.0.4 / 2013-01-29
==================

  * added; db abstraction
  * updated; driver 1.2.11
  * db; remove created collection on refresh
  * db; add db.help() and db.method.help()
  * db; always force close the connection on db.close()
  * db; refresh collections after dropping

0.0.3 / 2013-01-25
==================

  * added; --eval support
  * fixed; stay open when files are passed
  * fixed; remove cached collections left after calling `collections`
  * fixed; always cb() after creating context
  * fixed; default db is now "test" unless auth is passed
  * removed; debug dependency
  * improved; logging
  * improved; docs

0.0.2 / 2013-01-24
==================

  * added; better logging
  * added; collection getters to default db
  * added; `show.tables` alias for `show.collections`
  * added; query result helper `p`
  * added; file execution support
  * removed; visionmedia/debug

0.0.1 / 2013-01-22
==================

  * initial release
