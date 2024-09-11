const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.post('/admin/login', adminController.login);
router.post('/admin/change-password', adminController.changePassword);

module.exports = router;
    