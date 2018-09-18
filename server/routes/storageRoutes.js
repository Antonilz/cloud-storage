const express = require('express');
const validate = require('express-validation');
const folderController = require('../controllers/folder');
const itemController = require('../controllers/item');
const fileController = require('../controllers/file');
const { authorize, ADMIN, LOGGED_USER } = require('../middlewares/auth');

const router = express.Router();

router.route('/folders/*').get(authorize(LOGGED_USER), folderController.get);

router
  .route('/folders/*')
  .post(authorize(LOGGED_USER), folderController.create);

router
  .route('/folders/*')
  .patch(authorize(LOGGED_USER), folderController.update);

router
  .route('/items/delete')
  .post(authorize(LOGGED_USER), itemController.delete);
router
  .route('/items/search')
  .post(authorize(LOGGED_USER), itemController.search);

router
  .route('/s3/sign')
  .get(authorize(LOGGED_USER), fileController.getUploadURL);

router
  .route('/files/create')
  .post(authorize(LOGGED_USER), fileController.create);
router
  .route('/files/get-urls')
  .post(authorize(LOGGED_USER), fileController.getDownloadURLs);

router
  .route('/items/update')
  .post(authorize(LOGGED_USER), itemController.update);
router
  .route('/items/addTag')
  .post(authorize(LOGGED_USER), itemController.addTag);
router
  .route('/items/deleteTag')
  .post(authorize(LOGGED_USER), itemController.deleteTag);
router
  .route('/items/searchTags')
  .post(authorize(LOGGED_USER), itemController.searchTags);
router
  .route('/items/filterByTags')
  .post(authorize(LOGGED_USER), itemController.filterByTags);

module.exports = router;
