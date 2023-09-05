const { exit } = require('process');

const { createLockFiles } = require('../utils/lockFile');
const { port } = require('../config');
const { start } = require('../server');
const { exec } = require('../npm');

const installAction = (args) => {
  // Do not create lock if the dependency/package is being installed globally
  if (args.indexOf('-g') === -1 && args.indexOf('--global') === -1) {
    createLockFiles();
  }

  start(port);

  exec(
    ['install', `--registry=http://localhost:${port}/ --package-lock=false`, ...args],
    (code) => {
      exit(code);
    }
  );
};

module.exports = {
  action: installAction,
};
