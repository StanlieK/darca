#!/usr/bin/env node
// Dependency Assisstent for Resolving Complicated

const { program } = require('commander');
const install = require('./cmd/install');
const retreat = require('./cmd/retreat');
const startServer = require('./cmd/startServer');
const cleanCache = require('./cmd/cleanCache');
const publish = require('./cmd/publish');
const unpublish = require('./cmd/unpublish');
const { version } = require('../package.json');

(async () => {
  program
    .name('darca')
    .description('Dependency Assistent for Really Complex Applications')
    .version(version)
    .helpOption('-H --HELP')
    .option('-r --registry [value]');

  program
    .command('install [args...]')
    .alias('i')
    .helpOption('-H --HELP')
    .allowUnknownOption()
    .description('decorates `npm install` to use local registry')
    .action(install.action);

  program
    .command('publish [args...]')
    .helpOption('-H --HELP')
    .allowUnknownOption()
    .description('decorates `npm publish` to use local registry')
    .action(publish.action);

  program
    .command('unpublish [args...]')
    .helpOption('-H --HELP')
    .allowUnknownOption()
    .description('decorates `npm unpublish` to use local registry')
    .action(unpublish.action);

  program
    .command('retreat')
    .description('removes modified package.json files and retreats original ones')
    .action(retreat.action);

  program
    .command('clean-cache')
    .alias('clean')
    .requiredOption('-y --yes', 'Accept cleaning cache')
    .description('cleans local registry')
    .action(cleanCache.action);

  program
    .command('start-server')
    .description('starts local registry (verdaccio) as a standolone server')
    .action(startServer.action);

  program.parse(process.argv);
})();
