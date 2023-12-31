const {
  readFileSync,
  readdirSync,
  statSync,
  existsSync,
  copyFileSync,
  writeFileSync,
} = require('fs');
const { join } = require('path');

const { rimrafSync } = require('rimraf');
const { exec } = require('../npm');
const { port } = require('../config');

const PACKAGE_JSON_FILE = 'package.json';
const PACKAGE_LOCK_JSON_FILE = 'package-lock.json';
const DARCA_LOCK_FILE = 'darca.lock.json';
const DARCA_PACKAGE_LOCK_FILE = 'darca.package-lock.json';

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
  const packageJson = readFileSync(join(rootDir, 'package.json'));
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
        resolve(stdout.trimStart().trimEnd().split('/node_modules')[0]);
      }
    });
  });
};

const overridePublishConfig = (path) => {
  const fileContent = readFileSync(path);
  const textualContent = fileContent.toString('utf-8');
  const tabSize = textualContent.split('\n')[1].split('"')[0].length;
  const jsonContent = JSON.parse(textualContent);

  if (jsonContent.publishConfig && jsonContent.publishConfig.registry) {
    jsonContent.publishConfig.registry = `http://localhost:${port}/`;

    writeFileSync(path, JSON.stringify(jsonContent, null, tabSize));
  }
};

const createLockFile = (path) => {
  const packageJsonPath = join(path, PACKAGE_JSON_FILE);
  const packageLockPath = join(path, PACKAGE_LOCK_JSON_FILE);
  const darcaLockPath = join(path, DARCA_LOCK_FILE);
  const darcaPackageLockPath = join(path, DARCA_PACKAGE_LOCK_FILE);

  if (existsSync(packageJsonPath) && !existsSync(darcaLockPath)) {
    if (process.env.DEBUG && process.env.DEBUG === 'true') {
      console.log(`Creating ${darcaLockPath} from ${packageJsonPath}`);
    }

    copyFileSync(packageJsonPath, darcaLockPath);
    overridePublishConfig(packageJsonPath);
  }

  if (existsSync(packageLockPath) && !existsSync(darcaPackageLockPath)) {
    if (process.env.DEBUG && process.env.DEBUG === 'true') {
      console.log(`Creating ${darcaPackageLockPath} from ${packageLockPath}`);
    }

    copyFileSync(packageLockPath, darcaPackageLockPath);
  }
};

const createLockFiles = async () => {
  const projectRoot = await getProjectRoot();
  const packageJsonFilePaths = getPackageJsonFiles(projectRoot);

  packageJsonFilePaths.forEach(createLockFile);
};

const retreatLockFile = (path) => {
  const packageJsonPath = join(path, PACKAGE_JSON_FILE);
  const packageLockPath = join(path, PACKAGE_LOCK_JSON_FILE);
  const darcaLockPath = join(path, DARCA_LOCK_FILE);
  const darcaPackageLockPath = join(path, DARCA_PACKAGE_LOCK_FILE);

  if (existsSync(darcaLockPath)) {
    if (process.env.DEBUG && process.env.DEBUG === 'true') {
      console.log(`Retreating ${packageJsonPath} from ${darcaLockPath}`);
    }

    rimrafSync(packageJsonPath);
    copyFileSync(darcaLockPath, packageJsonPath);
    rimrafSync(darcaLockPath);
  }

  if (existsSync(darcaPackageLockPath)) {
    if (process.env.DEBUG && process.env.DEBUG === 'true') {
      console.log(`Retreating ${packageLockPath} from ${darcaPackageLockPath}`);
    }

    rimrafSync(packageLockPath);
    copyFileSync(darcaPackageLockPath, packageLockPath);
    rimrafSync(darcaPackageLockPath);
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
