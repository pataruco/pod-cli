const AWS = require('aws-sdk');
const fs = require('fs');
const log = require('../../lib/logger');
var { DateTime } = require('luxon');

const {
  POD_AWS_ACCESS_KEY_ID,
  POD_AWS_SECRET_ACCESS_KEY,
  POD_BUCKET_NAME,
} = process.env;

AWS.config.update({
  accessKeyId: POD_AWS_ACCESS_KEY_ID,
  secretAccessKey: POD_AWS_SECRET_ACCESS_KEY,
});

const MANIFEST = 'manifest.json';
const MANIFEST_PATH = `./data/${MANIFEST}`;

const dateregex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/gm;

const s3 = new AWS.S3();

let allKeys = [];

function getFileList() {
  return new Promise((resolve, reject) => {
    let params = {
      Bucket: `${POD_BUCKET_NAME}`,
      Delimiter: '/',
      Prefix: 'production/',
      MaxKeys: 1000,
    };

    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        reject(console.error(err, err.stack));
      }

      if (data.IsTruncated) {
        params.ContinuationToken = data.NextContinuationToken;
        listAllKeys();
      }

      const success = () => {
        const contents = data.Contents;
        contents.forEach(content => {
          allKeys.push(content.Key);
        });
        log.success('Retrieve all files from S3');
        return allKeys;
      };
      resolve(success());
    });
  });
}

const getDateString = file => {
  return file.match(dateregex)[0];
};

const createObject = async list => {
  return new Promise(resolve => {
    const manifest = { updated: DateTime.local().toString(), dates: [] };
    const datesArray = [];

    let counter = 0;
    for (const url of list) {
      const dateString = getDateString(url);
      log.message(`Processing file from date ${dateString}`);
      if (datesArray.includes(dateString)) {
        const index = manifest.dates.findIndex(
          item => item.date === dateString,
        );
        manifest.dates[index].files.push({ url });
      } else {
        const newDate = {
          date: dateString,
          files: [{ url }],
        };
        manifest.dates.push(newDate);
        datesArray.push(dateString);
      }
      counter++;
      log.success(`${counter}/${list.length} files processed`);
    }
    resolve(manifest);
  });
};

const createFileFrom = object => {
  log.message('Creating file to upload');
  const json = JSON.stringify(object);

  return new Promise((resolve, reject) => {
    fs.writeFile(MANIFEST_PATH, json, error => {
      if (error) {
        reject(console.error(error));
      }
      resolve(log.success('The file was saved!'));
    });
  });
};

const uploadManifest = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(MANIFEST_PATH, (err, data) => {
      if (err) {
        console.error(error);
      }

      const base64data = new Buffer.from(data, 'binary');
      const params = {
        Bucket: `${POD_BUCKET_NAME}/production/manifest`,
        Key: MANIFEST,
        Body: base64data,
        ACL: 'public-read',
      };

      s3.upload(params, (error, data) => {
        if (error) {
          reject(console.error(error));
        }

        const success = () => {
          console.log(data);
          log.success(`${MANIFEST} uploaded`);
        };
        resolve(success());
      });
    });
  });
};

const update = async () => {
  log.success('Starting updating');
  const list = await getFileList();
  const object = await createObject(list);
  await createFileFrom(object);
  await uploadManifest();
  log.success('Done!');
};

module.exports = { update };
