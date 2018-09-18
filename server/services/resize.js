const sharp = require('sharp');
const { getObject, putObject } = require('./minio');
const fs = require('fs');

async function createImagePreview(uuid) {
  const imageStream = await getObject('mpei', uuid);
  const transformer = sharp()
    .resize(256, 256)
    .max()
    .png()
    .toBuffer((err, data) => {
      putObject('previews', `${uuid}-256x256.png`, data);
    });
  await imageStream.pipe(transformer);
}

module.exports = {
  createImagePreview
};
