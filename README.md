#gomon
========

MongoDB shell written in Node.js


_Work in Progress_

## Usage

```
$ gomon --help

  Usage: gomon [options] [db address]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    --port <port>  port to connect to
    --host <host>  server to connect to

  db address:
    foo                     foo database on local machine
    192.169.0.5/foo         foo database on 192.168.0.5 machine
    192.169.0.5:9999/foo    foo database on 192.168.0.5 machine on port 9999
    mongodb://host:port/db  mongo URI
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
- `use()`: switch databases
- `exit`: exits the shell

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

Show the dev database collections

```js
gomon> show.collections
system.indexes
users
products
```

Get a count of the users collection

```js
gomon> db.users.count(console.log)
gomon> null 392984
```

### Debugging

`gomon` uses [visionmedia/debug](https://github.com/visionmedia/debug) to aid with debugging. Enable it like so:

```
DEBUG=gomon gomon localhost:27017
```

[LICENSE](https://github.com/aheckmann/gomon/blob/master/LICENSE)
