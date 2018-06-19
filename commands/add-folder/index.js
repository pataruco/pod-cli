const fs = require('fs');
const isImage = require('is-image');
const ExifImage = require('exif').ExifImage;
const { DateTime } = require('luxon');

const getDatePictureTaken = async image => {
  try {
    new ExifImage({ image }, async (e, exifData) => {
      const datePictureTaken = await exifData.exif.DateTimeOriginal;
      const dateArray = datePictureTaken.split(' ')[0].split(':');
      const timeArray = datePictureTaken.split(' ')[1].split(':');

      const date = await DateTime.local(
        parseInt(dateArray[0], 10),
        parseInt(dateArray[1], 10),
        parseInt(dateArray[2], 10),
        parseInt(timeArray[0], 10),
        parseInt(timeArray[1], 10),
        parseInt(timeArray[2], 10),
      );
      console.log(date);
      return date;
    });
  } catch (e) {
    console.error(error.message);
  }
};

const getFiles = path => {
  return fs
    .readdirSync(path)
    .filter(file => isImage(file))
    .map(file => `${path}/${file}`);
};

const renameImagefilenames = async images => {
  const dates = [];
  images.forEach(image => {
    try {
      new ExifImage({ image }, async (_, exifData) => {
        const datePictureTaken = await exifData.exif.DateTimeOriginal;
        const dateArray = datePictureTaken.split(' ')[0].split(':');
        const timeArray = datePictureTaken.split(' ')[1].split(':');

        const date = await DateTime.local(
          parseInt(dateArray[0], 10),
          parseInt(dateArray[1], 10),
          parseInt(dateArray[2], 10),
          parseInt(timeArray[0], 10),
          parseInt(timeArray[1], 10),
          parseInt(timeArray[2], 10),
        );
        const dateString = `${date.year}-${date.month}-${date.day}`;
        let counter = 0;

        if (dates.includes(dateString)) {
          // check why this is not adding
          counter = counter + 1;
          let newFileName = `${dateString}_${counter}`;
          console.log(newFileName);
          console.log(dates);
        } else {
          dates.push(dateString);
        }
      });
    } catch (e) {
      console.error(error.message);
    }
  });
};

const addFolder = async path => {
  const images = await getFiles(path);
  console.log(images);
};

module.exports = { addFolder };
