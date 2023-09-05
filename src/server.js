const os = require('os');
const { runServer } = require('verdaccio');
const { join } = require('path');
const { program } = require('commander');

const { exec } = require('./npm');

const DARCA_PATH = join(os.homedir(), '.darca');
const DARCA_STORAGE_PATH = join(DARCA_PATH, 'storage');

const DARCA_DEFAULT_REGISTRY = 'https://registry.npmjs.org/';

const getServerConfig = () => {
  const globalOpts = program.optsWithGlobals();
  let registry = DARCA_DEFAULT_REGISTRY;

  if (process.env.REGISTRY) {
    registry = process.env.REGISTRY;
  } else if (globalOpts.registry) {
    registry = globalOpts.registry;
  } else {
    exec(['config', 'get', 'registry'], null, (error, stdout) => {
      if (error) {
        return;
      }

      if (stdout) {
        registry = stdout;
      }
    });
  }

  return {
    storage: DARCA_STORAGE_PATH,
    plugins: join(DARCA_PATH, 'plugins'),
    web: { title: 'Verdaccio' },
    uplinks: { defaultRegistry: { url: registry } },
    packages: {
      '@*/*': {
        access: '$anonymous',
        publish: '$anonymous',
        unpublish: '$anonymous',
        proxy: 'defaultRegistry',
      },
      '**': {
        access: '$anonymous',
        publish: '$anonymous',
        unpublish: '$anonymous',
        proxy: 'defaultRegistry',
      },
    },
    allow_publish: '$anonymous',
    server: { keepAliveTimeout: 60 },
    middlewares: { audit: { enabled: true } },
    logs: {
      type: 'file',
      format: 'pretty-timestamped',
      level: 'error',
      colors: 'false',
      path: join(process.cwd(), 'darca.error.log'),
    },
    self_path: 'verdaccio',
  };
};

const start = async (port, customConfig) => {
  const app = await runServer({ ...getServerConfig(), ...customConfig });

  app.listen(port, () => {
    // do nothing
  });
};

module.exports = {
  start,
  storagePath: DARCA_STORAGE_PATH,
};
