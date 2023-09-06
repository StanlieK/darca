const { exit } = require('process');

const { port } = require('../config');
const { start } = require('../server');
const { exec } = require('../npm');

const unpublishAction = (args) => {
  start(port);

  exec(
    [
      'unpublish',
      `--registry=http://localhost:${port}/ --//localhost:${port}/:_authToken=MYTOKEN --force`,
      ...args,
    ],
    (code) => {
      exit(code);
    }
  );
};

module.exports = {
  action: unpublishAction,
};
