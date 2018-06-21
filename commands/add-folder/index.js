const AWS = require('aws-sdk');
const fs = require('fs');
const isImage = require('is-image');
const { ExifImage } = require('exif');
const { DateTime } = require('luxon');
const sharp = require('sharp');
const {
  POD_AWS_ACCESS_KEY_ID,
  POD_AWS_SECRET_ACCESS_KEY,
  POD_BUCKET_NAME,
} = process.env;
const log = require('../../lib/logger');

AWS.config.update({
  accessKeyId: POD_AWS_ACCESS_KEY_ID,
  secretAccessKey: POD_AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const getFiles = path => {
  log.message('Getting images ...');
  return fs
    .readdirSync(path)
    .filter(file => isImage(file))
    .map(file => `${path}/${file}`);
};

const getDatePictureTaken = image => {
  return new Promise((resolve, reject) => {
    try {
      new ExifImage({ image }, async (_, exifData) => {
        log.message(`Getting date from ${image}`);
        resolve(exifData.exif.DateTimeOriginal);
      });
    } catch (error) {
      log.error(error);
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
  return new Promise((resolve, reject) => {
    fs.readFile(image, (err, data) => {
      if (err) {
        console.error(error);
      }

      const base64data = new Buffer.from(data, 'binary');
      const params = {
        Bucket: `${POD_BUCKET_NAME}/local`,
        Key: fileName,
        Body: base64data,
        ACL: 'public-read',
      };

      s3.upload(params, (error, data) => {
        if (error) {
          reject(console.error(error));
        }

        const success = () => {
          console.log(data);
          log.success(`${fileName} uploaded`);
        };
        resolve(success());
      });
    });
  });
};

const deleteFolder = path => {
  return new Promise(resolve => {
    const success = () => {
      if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(file => {
          const curPath = path + '/' + file;
          fs.lstatSync(curPath).isDirectory()
            ? deleteFolder(curPath)
            : fs.unlinkSync(curPath);
        });
        fs.rmdirSync(path);
        log.message(`Deleting ${path}`);
      }
    };
    resolve(success());
  });
};

const uploadImages = async path => {
  const uploadPath = getUploadPath(path);
  const images = getFiles(uploadPath);

  log.message(`Processing ${images.length} images to upload... `);

  const toUpload = await images.map(async image => {
    return await uploadImage(image);
  });

  return Promise.all(toUpload).then(() => {
    deleteFolder(path);
    log.success(`Process finished`);
  });
};

const renameImagefilenames = async (path, images) => {
  log.message(`Processing ${images.length} images... `);
  let counter = 0;
  for (const image of images) {
    const DateTimeOriginal = await getDatePictureTaken(image);
    const date = getDate(DateTimeOriginal);
    const fileExtension = getfileExtension(image);
    newFileName = getNewFileName(date, fileExtension);
    const newPathFileName = `${path}/${newFileName}`;
    fs.renameSync(image, newPathFileName);
    await optimiseImage(path, newPathFileName, newFileName);
    counter++;
    log.message(`${counter}/${images.length} renamed and optimised`);
  }
  uploadImages(path);
};

const addFolder = async path => {
  const images = getFiles(path);
  renameImagefilenames(path, images);
};

module.exports = { addFolder };
