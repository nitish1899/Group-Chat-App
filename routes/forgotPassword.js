const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controllers/forgotPassword');

router.use('/forgotPassword',forgotPasswordController.forgotPassword);
router.use('/resetPassword/:id',forgotPasswordController.resetPassword);
router.use('/updatePassword/:resetPasswordid',forgotPasswordController.updatePassword);

module.exports = router;