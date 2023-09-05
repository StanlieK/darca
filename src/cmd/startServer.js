const { port } = require('../config');
const { start } = require('../server');

const startServerAction = async () => {
  await start(port, { logs: { type: 'stdout', format: 'pretty', level: 'http' } });
};

module.exports = {
  action: startServerAction,
};
