const { readFileSync, readdirSync, statSync, existsSync, copyFileSync } = require('fs');
const { join } = require('path');

const { rimrafSync } = require('rimraf');
const { exec } = require('../npm');

const PACKAGE_JSON_FILE = 'package.json';
const DARCA_LOCK_FILE = 'darca.lock.json';

const findPackageJsonFiles = (dir) => {
  const packageJsonFiles = [];

  const traverse = (currentDir) => {
    if (currentDir.indexOf('node_modules') > -1) {
      return;
    }

    const files = readdirSync(currentDir);

    for (const file of files) {
      if (file === 'package.json') {
        packageJsonFiles.push(currentDir);
        return;
      }
    }

    // After processing non-directory files, recursively search subdirectories
    for (const file of files) {
      const filePath = join(currentDir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory() && file !== 'node_modules') {
        traverse(filePath); // Recursively search subdirectories if not 'node_modules'
      }
    }
  };

  traverse(dir);
  return packageJsonFiles;
};

const getPackageJsonFiles = (rootDir) => {
  const packageJson = readFileSync('./package.json');
  const workspaces = JSON.parse(packageJson.toString('utf-8')).workspaces;

  if (!workspaces) {
    return [rootDir];
  }

  const workspacesPaths = workspaces.reduce((acc, w) => {
    const workspaceRoot = w.indexOf('*') > -1 ? w.split('*')[0] : w;

    if (acc.indexOf(workspaceRoot) === -1) {
      acc.push(join(rootDir, workspaceRoot));
    }

    return acc;
  }, []);

  const packageJsonFiles = workspacesPaths.reduce((acc, wp) => {
    return [...acc, ...findPackageJsonFiles(wp)];
  }, []);

  return [rootDir, ...packageJsonFiles];
};

const getProjectRoot = async () => {
  return new Promise((resolve) => {
    exec(['root'], null, (error, stdout) => {
      if (error) {
        resolve('./');
        return;
      }

      if (stdout) {
        resolve(stdout.split('/node_modules')[0]);
      }
    });
  });
};

const createLockFile = (path) => {
  const packageLockPath = join(path, PACKAGE_JSON_FILE);
  const darcaLockPath = join(path, DARCA_LOCK_FILE);

  if (existsSync(packageLockPath) && !existsSync(darcaLockPath)) {
    if (process.env.DEBUG) {
      console.log(`Creating ${darcaLockPath} from ${packageLockPath}`);
    }

    copyFileSync(packageLockPath, darcaLockPath);
  }
};

const createLockFiles = async () => {
  const projectRoot = await getProjectRoot();
  const packageJsonFilePaths = getPackageJsonFiles(projectRoot);

  packageJsonFilePaths.forEach(createLockFile);
};

const retreatLockFile = (path) => {
  const packageLockPath = join(path, PACKAGE_JSON_FILE);
  const darcaLockPath = join(path, DARCA_LOCK_FILE);

  if (existsSync(join(path, DARCA_LOCK_FILE))) {
    if (process.env.DEBUG) {
      console.log(`Retreating ${packageLockPath} from ${darcaLockPath}`);
    }

    rimrafSync(packageLockPath);
    copyFileSync(darcaLockPath, packageLockPath);
    rimrafSync(darcaLockPath);
  }
};

const retreat = async () => {
  const projectRoot = await getProjectRoot();
  const packageJsonFilePaths = getPackageJsonFiles(projectRoot);

  packageJsonFilePaths.forEach(retreatLockFile);
  rimrafSync(join(projectRoot, 'darca.error.log'));
};

module.exports = {
  createLockFiles,
  retreat,
};
