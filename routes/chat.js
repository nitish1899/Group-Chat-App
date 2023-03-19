const express = require('express');
const chatController = require('../controllers/chat');
const authentication = require('../middleware/auth');

const router = express.Router();

router.post('/sendMessage/:groupId', authentication.authenticate,  chatController.sendMessage);

router.get('/getMessage/:groupId' , authentication.authenticate,  chatController.getMessage);

router.get('/getUsers/:groupId' ,  chatController.getUsers);

router.post('/addUser/:groupId' , authentication.authenticate,  chatController.addUser);

router.post('/makeAdmin/:groupId' , authentication.authenticate,  chatController.makeAdmin);

router.post('/deleteUser/:groupId' , authentication.authenticate,  chatController.deleteUser);

router.post('/removeAdmin/:groupId' , authentication.authenticate,  chatController.removeAdmin);

const multer = require('multer');//multer is a node.js middleware for handling multipart/form-data(files in submitted form), which is primarily used for uploading files
const upload = multer(); // body-parser does not support multipart data . So we use multer to parse the form

router.post('/sendFile/:groupId' , authentication.authenticate, upload.single('file'), chatController.sendFile);

module.exports = router;