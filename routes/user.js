const express = require('express');
const signupController = require('../controller/user');
const router = express.Router();

router.post('/signup', signupController.postSignUp);

module.exports = router;