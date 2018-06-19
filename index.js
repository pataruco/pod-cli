#!/usr/bin/env node
const program = require('commander');
const { addFolder } = require('./commands/add-folder');

program.command('add-folder <dir>').action(dir => {
  addFolder(dir);
});

program.parse(process.argv);
