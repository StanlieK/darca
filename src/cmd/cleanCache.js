const { rimrafSync } = require('rimraf');
const { storagePath } = require('../server');

const cleanCacheAction = () => {
  rimrafSync(storagePath);
};

module.exports = {
  action: cleanCacheAction,
};
