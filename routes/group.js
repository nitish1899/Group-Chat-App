const express = require('express');
const router = express.Router();

const groupController = require('../controllers/group');
const authentication = require('../middleware/auth');

router.use('/createGroup', authentication.authenticate, groupController.createGroup);

router.get('/getGroup' , authentication.authenticate, groupController.getGroups)

router.get('/delete/:id' , authentication.authenticate, groupController.deleteGroup);

router.post('/getAllGroups' , groupController.getAllGroups);

router.get('/join/:id' , authentication.authenticate , groupController.joinGroup);

module.exports = router;
