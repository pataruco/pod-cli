#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const isImage = require('is-image');

const getFiles = path => {
  return fs.readdirSync(path).filter(file => isImage(file));
};

const addFolder = async path => {
  const images = await getFiles(path);
};

program.command('add-folder <dir>').action(dir => {
  addFolder(dir);
});

// program.parse(process.argv);
