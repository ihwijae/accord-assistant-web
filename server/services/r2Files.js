const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { createR2Client, getR2Config } = require('../lib/r2Client');

const client = createR2Client();
const { bucket } = getR2Config();

function buildPublicUrl(key) {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return null;
  const normalizedBase = base.replace(/\/+$/, '');
  const encodedKey = key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${normalizedBase}/${encodedKey}`;
}

async function uploadBuffer({ key, body, contentType }) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType || 'application/octet-stream'
  });

  await client.send(command);
  return { key, publicUrl: buildPublicUrl(key) };
}

async function getDownloadUrl({ key, expiresIn = 900 }) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn });
}

async function deleteObject({ key }) {
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await client.send(command);
}

module.exports = {
  uploadBuffer,
  getDownloadUrl,
  deleteObject,
  buildPublicUrl
};
