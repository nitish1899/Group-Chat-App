const express = require('express');
const chatController = require('../controllers/chat');

const router = express.Router();
const authentication = require('../middleware/auth');

router.use('/sendMessage', authentication.authenticate, chatController.postMessage);
router.use('/getMessage', authentication.authenticate, chatController.getMessage);

module.exports = router;