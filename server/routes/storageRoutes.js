const express = require('express');
const validate = require('express-validation');
const folderController = require('../controllers/folder');
const itemController = require('../controllers/item');
const fileController = require('../controllers/file');
const awsController = require('../controllers/aws');
const { authorize, ADMIN, LOGGED_USER } = require('../middlewares/auth');

const router = express.Router();

// get folder info
router.route('/folders/*').get(authorize(LOGGED_USER), folderController.get);

// create new folder
router
  .route('/folders/*')
  .post(authorize(LOGGED_USER), folderController.create);

// update folder info (tags, path, permissions, etc.)
router
  .route('/folders/*')
  .patch(authorize(LOGGED_USER), folderController.update);

// delete array of items (files, folders) and all children folders
router
  .route('/items/delete')
  .post(authorize(LOGGED_USER), itemController.delete);
router
  .route('/items/search/*')
  .get(authorize(LOGGED_USER), itemController.search);

router
  .route('/s3/sign')
  .get(authorize(LOGGED_USER), awsController.getSignedUploadLink);

// link amazon s3 uuid to DB model
router.route('/files/*').post(authorize(LOGGED_USER), fileController.create);
/*router
  .route('/file/:id')
  .get(authorize(LOGGED_USER), awsController.getSignedDownloadLink);
// update file info (tags, path, permissions, etc.)
router
  .route('files/:fileID')
  .patch(authorize(LOGGED_USER), fileController.update);

// update tags of array of items
router
  .route('/items/update')
  .post(authorize(LOGGED_USER), itemController.update);
// upload new file(s)
*/

module.exports = router;
