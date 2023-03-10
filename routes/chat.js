const express = require('express');
const chatController = require('../controllers/chat');

const router = express.Router();
const authentication = require('../middleware/auth');

// router.use('/sendMessage', authentication.authenticate, chatController.postMessage);
// router.use('/getLastMessage', authentication.authenticate, chatController.getMessage);

router.post('/sendMessage/:groupId', authentication.authenticate,  chatController.sendMessage);

router.get('/getMessage/:groupId' , authentication.authenticate,  chatController.getMessage);

router.get('/getUsers/:groupId' ,  chatController.getUsers);

router.post('/addUser/:groupId' , authentication.authenticate,  chatController.addUser);

router.post('/makeAdmin/:groupId' , authentication.authenticate,  chatController.makeAdmin);

router.post('/deleteUser/:groupId' , authentication.authenticate,  chatController.deleteUser);

router.post('/removeAdmin/:groupId' , authentication.authenticate,  chatController.removeAdmin);

module.exports = router;