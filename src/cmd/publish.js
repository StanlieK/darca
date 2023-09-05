const { exit } = require('process');

const { port } = require('../config');
const { start } = require('../server');
const { exec } = require('../npm');

const publishAction = (args) => {
  start(port);

  exec(
    [
      'publish',
      `--registry=http://localhost:${port}/ --//localhost:3000/:_authToken=MYTOKEN`,
      ...args,
    ],
    (code) => {
      exit(code);
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);

        if (error.message && error.message.indexOf('Cannot publish over existing version.') > -1) {
          console.log(`Possible resolution: Try to run \`darca unpublish ${args}\` first.`);
        }
        return;
      }

      if (stdout) {
        console.log(`${stdout}`);
      }

      if (stderr) {
        console.log('err');
        console.error(`${stderr}`);
      }
    }
  );
};

module.exports = {
  action: publishAction,
};
