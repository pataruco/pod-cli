const fs = require('fs');
const isImage = require('is-image');
const { ExifImage } = require('exif');
const { DateTime } = require('luxon');
const sharp = require('sharp');

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
const getNewFileName = (date, fileExtension) => {
  const dateString = `${date.year}-${date.month}-${date.day}`;

  if (dates.includes(dateString)) {
    counter++;
    return `${dateString}_${counter}.${fileExtension}`;
  } else {
    counter = 1;
    dates = [];
    dates.push(dateString);
    return `${dateString}_${counter}.${fileExtension}`;
  }
};

const getfileExtension = fileString => {
  const indexStart = fileString.length - 3;
  return fileString.substring(indexStart);
};

const createUploadFolder = path => {
  const newFolder = `${path}/upload`;
  if (!fs.existsSync(newFolder)) {
    fs.mkdirSync(newFolder);
  }
};

const optimiseImage = (path, imageFullPath, image) => {
  const newFile = `${path}/upload/${image}`;
  createUploadFolder(path);

  sharp(imageFullPath)
    .rotate()
    .withMetadata()
    .resize(800)
    .toFile(newFile, (error, info) => {
      !error ? console.log(info) : console.error(error);
    });
};

const renameImagefilenames = async (path, images) => {
  for (const image of images) {
    const DateTimeOriginal = await getDatePictureTaken(image);
    const date = getDate(DateTimeOriginal);
    const fileExtension = getfileExtension(image);
    newFileName = getNewFileName(date, fileExtension);
    const newPathFileName = `${path}/${newFileName}`;
    fs.renameSync(image, newPathFileName);
    optimiseImage(path, newPathFileName, newFileName);
  }
};

const addFolder = async path => {
  const images = getFiles(path);
  await renameImagefilenames(path, images);
  // console.log('-------------------------Done');
};

module.exports = { addFolder };
