#!/usr/bin/env node
const program = require('commander');
const { addFolder } = require('./commands/add-folder');
const { update } = require('./commands/update');

program
  .command('add-folder')
  .description('Optimise images and upload it to S3')
  .action(dir => {
    addFolder(dir);
  });

program
  .command('update')
  .description('Update pod pictures manifest')
  .action(() => {
    update();
  });

program.parse(process.argv);
