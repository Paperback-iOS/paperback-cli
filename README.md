paperback-cli
=============

Paperback CLI for common tools

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/paperback-cli.svg)](https://npmjs.org/package/paperback-cli)
[![Downloads/week](https://img.shields.io/npm/dw/paperback-cli.svg)](https://npmjs.org/package/paperback-cli)
[![License](https://img.shields.io/npm/l/paperback-cli.svg)](https://github.com/FaizanDurrani/paperback-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g paperback-cli
$ paperback COMMAND
running command...
$ paperback (-v|--version|version)
paperback-cli/1.2.2 darwin-x64 node-v15.3.0
$ paperback --help [COMMAND]
USAGE
  $ paperback COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`paperback bundle`](#paperback-bundle)
* [`paperback help [COMMAND]`](#paperback-help-command)
* [`paperback serve`](#paperback-serve)

## `paperback bundle`

```
USAGE
  $ paperback bundle

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/bundle.ts](https://github.com/FaizanDurrani/paperback-cli/blob/v1.2.2/src/commands/bundle.ts)_

## `paperback help [COMMAND]`

```
USAGE
  $ paperback help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `paperback serve`

```
USAGE
  $ paperback serve

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 8080]
```

_See code: [src/commands/serve.ts](https://github.com/FaizanDurrani/paperback-cli/blob/v1.2.2/src/commands/serve.ts)_
<!-- commandsstop -->
