const fs = require('fs');
const isImage = require('is-image');
const { ExifImage } = require('exif');
const { DateTime } = require('luxon');

// const getDatePictureTaken = async image => {
//   try {
//     new ExifImage({ image }, async (e, exifData) => {
//       const datePictureTaken = await exifData.exif.DateTimeOriginal;
//       const dateArray = datePictureTaken.split(' ')[0].split(':');
//       const timeArray = datePictureTaken.split(' ')[1].split(':');

//       const date = await DateTime.local(
//         parseInt(dateArray[0], 10),
//         parseInt(dateArray[1], 10),
//         parseInt(dateArray[2], 10),
//         parseInt(timeArray[0], 10),
//         parseInt(timeArray[1], 10),
//         parseInt(timeArray[2], 10),
//       );
//       console.log(date);
//       return date;
//     });
//   } catch (e) {
//     console.error(error.message);
//   }
// };

// const getDatePictureTaken = image => {
//   return new ExifImage({ image }, (e, exifData) => exifData);
// };

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

const renameImagefilenames = async images => {
  for (const image of images) {
    const DateTimeOriginal = await getDatePictureTaken(image);
    const date = getDate(DateTimeOriginal);
    console.log(date);
  }
};

const addFolder = path => {
  const images = getFiles(path);
  renameImagefilenames(images);
};

module.exports = { addFolder };
