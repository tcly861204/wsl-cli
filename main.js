#!/usr/bin/env node
const program = require('commander');
const shell = require('shelljs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const clone = require('./lib/clone');
const pkg = require('./package');
program
  .version(pkg.version)
  .description(pkg.dependencies)
program
  .command('init')
  .alias('i')
  .description('请选择模版初始化工程')
  .action(function() {
    require('figlet')('WSL', function(err, data) {
      if (data) {
        console.log(chalk.red(data))
      }

      console.log('目前WSL-cli支持以下模板：');
      listTemplateToConsole();
      const prompt = inquirer.createPromptModule();
      prompt({
        type: 'list',
        name: 'type',
        message: '项目类型:',
        default: 'r   - React 最佳实践',
        choices: [
          'api - Api 服务器工程',
          'io  - Socket 服务器工程',
          'mi  - Node.js 微服务器工程',
          'r   - React 最佳实践',
          'ra  - React 后台管理最佳实践',
          'rn  - React Native 最佳实践',
          'v   - Vue 最佳实践',
      ],
    }).then((res) => {
        const type = res.type.split(' ')[0];
        prompt({
          type: 'input',
          name: 'project',
          message: '项目名称:',
          validate: function (input) {
            // Declare function as asynchronous, and save the done callback
            const done = this.async();
            // Do async stuff
            setTimeout(function() {
              if (!input) {
                // Pass the return value in the done callback
                done('You need to provide a dirName.');
                return;
              }
              // Pass the return value in the done callback
              done(null, true);
            }, 0);
          }
        }).then((iRes) => {
          const project = iRes.project;
          let pwd = shell.pwd();
          clone(`https://github.com/skyFi/skylor-${type}.git`, pwd + `/${project}`, {
            success() {
              // 删除 git 目录
              shell.rm('-rf', pwd + `/${project}/.git`);

              // 提示信息
              console.log(`项目地址：${pwd}/${project}/`);
              console.log('接下来你可以：');
              console.log('');
              console.log(chalk.blue(`    $ cd ${project}`));
              console.log(chalk.blue(`    $ npm install`));
              console.log(chalk.blue(`    $ npm start`));
              console.log('');
            },
            fail(err) {
              console.log(chalk.red(`${err}`));
            },
            onData(data = '') {
              const d = data.toString();
              if (d.indexOf('fatal') !== -1 || d.indexOf('error') !== -1) {
                console.log(chalk.red(`${data}`));
              } else {
                console.log(chalk.blue(`${data}`));
              }
            },
          })
        });
      });
    });
  }).on('--help', function() {
  console.log('');
  console.log('Examples:');
  console.log('');
  console.log(chalk.blue('  $ wsl i'));
  console.log(chalk.blue('  $ wsl init'));
  console.log('');
  console.log('All Available Templates:');
  listTemplateToConsole();
});

program.parse(process.argv);

function listTemplateToConsole() {
  console.log('');
  console.log(chalk.green('  api  -  Api 服务器工程'));
  console.log(chalk.green('  io   -  Socket 服务器工程'));
  console.log(chalk.green('  mi   -  Nodejs 微服务器工程'));
  console.log(chalk.green('  r    -  React 最佳实践'));
  console.log(chalk.green('  ra   -  React 后台管理最佳实践'));
  console.log(chalk.green('  rn   -  React Native 最佳实践'));
  console.log(chalk.green('  v    -  Vue 最佳实践'));
  console.log('');
}