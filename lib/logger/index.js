const chalk = require('chalk');

const error = string => console.log(chalk.bold.red(string));
const message = string => console.log(chalk.bold.yellow(string));
const success = string => console.log(chalk.bold.green(string));
const warning = string => console.log(chalk.bold.orange(string));

const log = {
  error,
  message,
  success,
  warning,
};

module.exports = log;
