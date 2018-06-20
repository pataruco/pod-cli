#!/usr/bin/env node
const program = require('commander');
const { addFolder } = require('./commands/add-folder');

program
  .command('add-folder')
  .description('Optimise images and upload it to S3')
  .action(dir => {
    addFolder(dir);
  });

program.parse(process.argv);
