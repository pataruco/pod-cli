#!/usr/bin/env node
import * as program from 'commander';
import { addFolder } from './commands/add-folder';
import { update } from './commands/update';

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

console.log('Peter');

program.parse(process.argv);
