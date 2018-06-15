# cloud-storage
S3-API compatible client-server. 
# server
built with Node.js, Express, mongoose.\
S3 client: minio || aws-sdk
# frontend
built with React-Redux stack\
async actions handling: Redux-saga+axios\
styling: Semantic-UI, styled-components\
forms: Redux-form\
routing: React-router
# installation
```npm install``` in client and server directories
create or use mongoDB server/service


fill in\
server/config/dev.js
```
module.exports = {
  mongoURI: 'mongo URI',
  jwtExpirationInterval: '20',
  secret: '12345',
  cookieKey: '1234567890',
  redirectDomain: 'http://localhost:3000',
  bucketName: 'your-bucket-name',
  endpoint: 'https://127.0.0.1:10000',
  storageAccessKey: 'storage-access-key',
  storageSecretAccessKey: 'storage-secret-acess-key'
};
```

then config your certificates
```
   cd server
   npm run dev
```
will start nodemon express.js server and Create React App dev server\
http://localhost:3000
