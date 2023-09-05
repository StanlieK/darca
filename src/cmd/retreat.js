const { retreat } = require('../utils/lockFile');

const retreatAction = () => {
  retreat();
};

module.exports = {
  action: retreatAction,
};
