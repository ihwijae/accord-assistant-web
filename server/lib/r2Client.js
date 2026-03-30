const { S3Client } = require('@aws-sdk/client-s3');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function getR2Config() {
  const accountId = requireEnv('R2_ACCOUNT_ID');
  const accessKeyId = requireEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = requireEnv('R2_SECRET_ACCESS_KEY');
  const bucket = requireEnv('R2_BUCKET');
  const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;

  return {
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    bucket
  };
}

function createR2Client() {
  const { region, endpoint, credentials } = getR2Config();
  return new S3Client({ region, endpoint, credentials });
}

module.exports = { createR2Client, getR2Config };
