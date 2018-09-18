module.exports = {
  mongoURI: process.env.MONGO_URI,
  bucketName: process.env.BUCKET_NAME,
  storageAccessKey: process.env.STORAGE_ACCESS_KEY,
  storageSecretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  secret: process.env.SECRET_JWT,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_INTERVAL,
  endpoint: process.env.S3_ENDPOINT
};
