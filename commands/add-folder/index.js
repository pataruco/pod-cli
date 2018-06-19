const AWS = require('aws-sdk');
const fs = require('fs');
const isImage = require('is-image');
const { ExifImage } = require('exif');
const { DateTime } = require('luxon');
const sharp = require('sharp');
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_NAME } = process.env;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

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

const getUploadPath = path => {
  return `${path}/upload`;
};

const optimiseImage = (path, imageFullPath, image) => {
  const uploadPath = getUploadPath(path);
  const newFile = `${uploadPath}/${image}`;
  createUploadFolder(path);

  return sharp(imageFullPath)
    .rotate()
    .withMetadata()
    .resize(800)
    .toFile(newFile)
    .then(info => console.log(info))
    .catch(err => console.error(err));
};

const uploadImage = image => {
  const fileName = image.split('/').pop();

  fs.readFile(image, (err, data) => {
    if (err) {
      throw err;
    }
    const base64data = new Buffer.from(data, 'binary');
    const params = {
      Bucket: `${BUCKET_NAME}/test`,
      Key: fileName,
      Body: base64data,
      ACL: 'public-read',
    };

    s3.upload(params, (error, data) => {
      error
        ? console.log(error)
        : console.log(data, 'Successfully uploaded package.');
    });
  });
};

const uploadImages = async path => {
  const uploadPath = getUploadPath(path);
  const images = getFiles(uploadPath);
  for (const image of images) {
    uploadImage(image);
  }
  //todo: logger
};

const renameImagefilenames = async (path, images) => {
  for (const image of images) {
    const DateTimeOriginal = await getDatePictureTaken(image);
    const date = getDate(DateTimeOriginal);
    const fileExtension = getfileExtension(image);
    newFileName = getNewFileName(date, fileExtension);
    const newPathFileName = `${path}/${newFileName}`;
    fs.renameSync(image, newPathFileName);
    await optimiseImage(path, newPathFileName, newFileName);
  }
  uploadImages(path);
};

const addFolder = async path => {
  const images = getFiles(path);
  renameImagefilenames(path, images);
};

module.exports = { addFolder };
