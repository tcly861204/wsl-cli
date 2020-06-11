'use strict';

const { spawn } = require('child_process');
const fs = require('fs');

module.exports = (repo, targetPath, opts = {}) => {
  const { success, fail, onData } = opts;

  emptyDirectory(targetPath, (isEmpty) => {
    if (!isEmpty) {
      fail(`fatal: destination path '${targetPath}' already exists and is not an empty directory.`);
      abort();
      return;
    }
    const git = opts.git || 'git';
    const args = ['clone'];

    if (opts.shallow) {
      args.push('--depth');
      args.push('1');
    }

    args.push('--');
    args.push(repo);
    args.push(targetPath);

    const child = spawn(git, args);
    child.on('close', function(status) {
      if (status === 0) {
        if (opts.checkout) {
          _checkout();
        } else {
          success && success();
        }
      } else {
        fail && fail(new Error("Failed with status " + status));
      }
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
      onData && onData(data.toString());
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
      onData && onData(data.toString());
    });

    function _checkout() {
      const args = ['checkout', opts.checkout];
      const process = spawn(git, args, { cwd: targetPath });
      process.on('close', function(status) {
        if (status === 0) {
          success && success();
        } else {
          fail && fail(new Error("'git checkout' failed with status " + status));
        }
      });
    }
  });
};

function abort() {
  process.exit(1);
}

// 判断目录是否为空
function emptyDirectory(path, fn) {
  fs.readdir(path, function (err, files) {
    if (err && 'ENOENT' !== err.code) {
      abort();
    }

    fn(!files || !files.length);
  });
}