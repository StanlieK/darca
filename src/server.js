const os = require('os');
const { runServer } = require('verdaccio');
const { join } = require('path');
const { program } = require('commander');

const { exec } = require('./npm');

const DARCA_PATH = join(os.homedir(), '.darca');
const DARCA_STORAGE_PATH = join(DARCA_PATH, 'storage');

const DARCA_DEFAULT_REGISTRY = 'https://registry.npmjs.org/';

const getRegistry = async () => {
  const globalOpts = program.optsWithGlobals();

  return new Promise((resolve) => {
    if (process.env.REGISTRY) {
      resolve(process.env.REGISTRY);
      return;
    }

    if (globalOpts.registry) {
      resolve(globalOpts.registry);
      return;
    }

    exec(['config', 'get', 'registry'], null, (error, stdout) => {
      if (error) {
        resolve(DARCA_DEFAULT_REGISTRY);
        return;
      }

      if (stdout) {
        resolve(stdout.trimStart().trimEnd());
      }
    });
  });
};

const getServerConfig = async () => {
  const registry = await getRegistry();

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
  const defaultServerConfig = await getServerConfig();
  const config = { ...defaultServerConfig, ...customConfig };

  if (process.env.DEBUG && process.env.DEBUG === 'true') {
    console.log('Starting server with following config:');
    console.log(JSON.stringify(config, null, 2));
  }

  const app = await runServer(config);

  app.listen(port, () => {
    // do nothing
  });
};

module.exports = {
  start,
  storagePath: DARCA_STORAGE_PATH,
};
