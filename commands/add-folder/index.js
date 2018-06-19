const fs = require('fs');
const isImage = require('is-image');
const { ExifImage } = require('exif');
const { DateTime } = require('luxon');

const getDatePictureTaken = image => {
  return new Promise((resolve, reject) => {
    try {
      new ExifImage({ image }, async (_, exifData) => {
        resolve(exifData.exif.DateTimeOriginal);
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getDate = date => {
  const dateArray = date.split(' ')[0].split(':');
  const timeArray = date.split(' ')[1].split(':');
  const newdate = DateTime.local(
    parseInt(dateArray[0], 10),
    parseInt(dateArray[1], 10),
    parseInt(dateArray[2], 10),
    parseInt(timeArray[0], 10),
    parseInt(timeArray[1], 10),
    parseInt(timeArray[2], 10),
  );
  return newdate;
};

const getFiles = path => {
  return fs
    .readdirSync(path)
    .filter(file => isImage(file))
    .map(file => `${path}/${file}`);
};

let dates = [];
let counter = 1;
const getNewFileName = (path, date, fileExtension) => {
  const dateString = `${date.year}-${date.month}-${date.day}`;

  if (dates.includes(dateString)) {
    counter++;
    return `${path}/${dateString}_${counter}.${fileExtension}`;
  } else {
    counter = 1;
    dates = [];
    dates.push(dateString);
    return `${path}/${dateString}_${counter}.${fileExtension}`;
  }
};

const getfileExtension = fileString => {
  const indexStart = fileString.length - 3;
  return fileString.substring(indexStart);
};

const renameImagefilenames = async (path, images) => {
  for (const image of images) {
    const DateTimeOriginal = await getDatePictureTaken(image);
    const date = getDate(DateTimeOriginal);
    const fileExtension = getfileExtension(image);
    newFileName = getNewFileName(path, date, fileExtension);
    fs.renameSync(image, newFileName);
  }
};

const addFolder = path => {
  const images = getFiles(path);
  renameImagefilenames(path, images);
};

module.exports = { addFolder };
