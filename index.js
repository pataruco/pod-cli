#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const isImage = require('is-image');
const ExifImage = require('exif').ExifImage;

const getExif = image => {
  try {
    new ExifImage({ image }, function(error, exifData) {
      if (error) console.log('Error: ' + error.message);
      else console.log(exifData); // Do something with your data!
    });
  } catch (error) {
    console.log('Error: ' + error.message);
  }
};

const getFiles = path => {
  fs.readdirSync(path).forEach(file => {
    if (isImage(file)) {
      const filepath = `${path}/${file}`;
      getExif(filepath);
    }
  });
  // return fs.readdirSync(path).filter(file => isImage(file));
};

const addFolder = async path => {
  const images = await getFiles(path);
  for (const image of images) {
    getExif(image);
  }
};

program.command('add-folder <dir>').action(dir => {
  addFolder(dir);
});

program.parse(process.argv);
