const { exec } = require('child_process');

const npmExec = (args, callback, outputCallback) => {
  const npmArgs = args.length > 0 ? args.join(' ') : '';

  if (process.env.DEBUG && process.env.DEBUG === 'true') {
    console.log(npmArgs);
  }

  // Run the npm command
  const child = exec(
    `npm ${npmArgs}`,
    outputCallback
      ? outputCallback
      : (error, _, _) => {
          if (error) {
            console.error(`Error: ${error}`);
            return;
          }
        }
  );

  if (!outputCallback) {
    child.stdout.on('data', (chunk) => {
      console.log(chunk);
    });

    child.stderr.on('data', (chunk) => {
      console.log(chunk);
    });
  }

  // Listen for the exit event
  child.on('exit', (code) => {
    if (callback) {
      setTimeout(() => {
        callback(code);
      }, 1000);
    }
  });
};

module.exports = {
  exec: npmExec,
};
