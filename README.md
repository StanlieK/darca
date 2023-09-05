# Dependency Assistent for Really Complex Applications

## Requirements

- `npm` >= 8

## Installation

You can install `darca` globally:

```bash
npm install -g darca@latest
```

Or use it with `npx`:

```bash
npx darca
```

## Usage

```
Usage: darca [options] [command]

Dependency Assistent for Really Complex Applications

Options:
  -V, --version                output the version number
  -r --registry
  -H --HELP                    display help for command

Commands:
  install|i [args...]          decorates `npm install` to use local registry
  publish [args...]            decorates `npm publish` to use local registry
  unpublish [args...]          decorates `npm unpublish` to use local registry
  retreat                      removes modified package.json files and retreats original ones
  clean-cache|clean [options]  cleans local registry
  start-server                 starts local registry (verdaccio) as a standolone server
  help [command]               display help for command
```
