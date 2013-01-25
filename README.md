#gomon
========

MongoDB shell written in Node.js


_Work in Progress_

## Usage

```
$ gomon --help

  Usage: gomon [options] [db address] [file names]

  Options:

    -h, --help        output usage information
    -V, --version     output the version number
    --port <port>     port to connect to
    --host <host>     server to connect to
    -e --eval <code>  evaluate script
    -v --version      print gomon's version
    --shell           run the shell after executing files

  db address:
    foo                     foo database on local machine
    192.169.0.5/foo         foo database on 192.168.0.5 machine
    192.169.0.5:9999/foo    foo database on 192.168.0.5 machine on port 9999
    mongodb://host:port/db  mongo URI

  file names:
    List of space delimited files (ending in .js) to execute.
    When passed, the shell exits after execution unless --shell
    is specified.
```

## Example

```
$ gomon mongodb://localhost:27017,hostA:27017,hostB/dev
gomon version 0.0.3
connecting to mongodb://localhost:27017,hostA:27017,hostB/dev
gomon>
```

## API

- `show.dbs`: list available databases
- `show.collections`: list available collections in current database
- `use[databaseName]`: switch databases
- `exit`: exits the shell
- `show.tables`: alias of `show.collections`
- `db.collection.findOne(p)`: find a single document and print it

More to come.

#### Example:

First we connect to fakehost.

```
$ gomon --host fakehost
gomon version 0.0.3
connecting to mongodb://fakehost
gomon>
```

Next we list the available databases()

```js
gomon> show.dbs
test                    0.203125GB
fake                    0.203125GB
dev                     0.203125GB
```

Switch to the dev database

```js
gomon> use.dev
```

For autocompletion, type `use.<TAB>` to see a list of available databases.

Display the dev database collections

```js
gomon> show.collections
system.indexes
users
products
```

Get a count of the users collection

```js
gomon> db.users.count(console.log)
gomon> null 1
```

Look up a user

```js
gomon> db.users.findOne(console.log)
gomon> null { _id: 50f99acfc50ea8c8ef23142c, name: 'gomon was here' }
```

`p` is a global helper for queries that performs pretty printing on results.

```js
gomon> db.users.findOne(p)
gomon>
error:  null
{ _id: 50f99acfc50ea8c8ef23142c,
  name: 'gomon was here' }
```

### Files

All arguments ending in `.js` will be treated as files and executed.

```js
// script1.js
console.log('gomongo');

// command line
$ gomon script1.js
gomon version 0.0.3
connecting to mongodb://localhost:27017/test
gomongo
------------------------------------------
  waiting for script to call `exit;` ...
  OR press Ctrl+D to quit immediately
------------------------------------------
gomon>
```

When files are passed, the shell will not automatically exit. This is so that async operations within scripts are not stopped prematurely. Your scripts must manage themselves, e.g. when all operations are completed, call `exit;`.

### Eval

Code may be evaled and printed to the shell by passing the `-e` or `--eval` flag.

```
$ gomon --eval "db.databaseName + ' is the default db'"
gomon version 0.0.3
connecting to mongodb://localhost:27017/test
test is the default db

bye
```

The shell will immediately exit after script evaluation unless the `--shell` flag is passed.

### Debugging

Enable debugging output:

```
DEBUG=gomon gomon localhost:27017
```

[LICENSE](https://github.com/aheckmann/gomon/blob/master/LICENSE)
