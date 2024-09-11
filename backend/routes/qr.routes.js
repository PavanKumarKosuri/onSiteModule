// backend\routes\qr.routes.js
const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');

router.get('/qr-reports', qrController.getQrReports);
router.post('/qr-reports', qrController.addQrReport);
router.put('/qr-reports/:id', qrController.updateQrReport);
router.delete('/qr-reports/:id', qrController.deleteQrReport);
router.get('/get-user-by-employee-id', qrController.getUserByEmployeeId);
router.get('/generateqr', qrController.getGenerateQr);
router.get('/generateqr/all', qrController.getAllGenerateQr);
router.get('/packages/:generateqrId', qrController.getPackagesByGenerateQrId);
router.get('/subpackages/:packageId', qrController.getSubpackagesByPackageId);
router.get('/packages/find/:packageId', qrController.findPackageById);
router.get('/subpackages/find/:subPackageId', qrController.findSubpackageById);
router.put('/generateqr/:id', qrController.updateGenerateQr);
router.put('/packages/:id', qrController.updatePackage);
router.put('/subpackages/:id', qrController.updateSubpackage);
router.delete('/generateqr/:id', qrController.deleteGenerateQr);
router.delete('/packages/:id', qrController.deletePackage);
router.delete('/subpackages/:id', qrController.deleteSubpackage);

module.exports = router;
