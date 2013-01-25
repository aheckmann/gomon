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
connecting to mongodb://localhost:27017,hostA:27017,hostB/dev
connected
gomon>
```

## API

- `show.dbs`: list available databases
- `show.collections`: list available collections in current database
- `use[databaseName]`: switch databases
- `exit`: exits the shell
- `show.tables`: alias of `show.collections`

More to come.

#### Example:

First we connect to fakehost.

```
$ gomon --host fakehost
connecting to mongodb://fakehost
connected
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

### Debugging

Enable debugging output:

```
DEBUG=gomon gomon localhost:27017
```

[LICENSE](https://github.com/aheckmann/gomon/blob/master/LICENSE)
