const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/checkout', orderController.checkout);
router.get('/my-orders', orderController.getUserOrders);
router.get('/my-orders/:id', orderController.getOrderById);
router.get('/', orderController.listAllOrders);
router.get('/delayed', orderController.getDelayedOrders);
router.put('/:id/status', orderController.updateStatus);
router.get('/:id', orderController.getOrderById);

router.get('/reports/sales', reportController.getSalesReport);
router.get('/reports/export/overdue-last-month', reportController.exportOverdueLastMonth);
router.get('/reports/export/last-month', reportController.exportLastMonth);

module.exports = router;