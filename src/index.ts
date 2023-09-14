#!/usr/bin/env node
// Dependency Assistant for Resolving Complicated

import { program } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';

import install from './cmd/install';
import retreat from './cmd/retreat';
import startServer from './cmd/startServer';
import cleanCache from './cmd/cleanCache';
import publish from './cmd/publish';
import unpublish from './cmd/unpublish';

(async () => {
  const packageFile = readFileSync(join(__dirname, '../package.json'));
  const { version } = JSON.parse(packageFile.toString('utf-8'));

  program
    .name('darca')
    .description('Dependency Assistant for Really Complex Applications')
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
