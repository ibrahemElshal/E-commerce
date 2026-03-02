const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { validate, cartValidation } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);
router.get('/', cartController.viewCart);
router.post('/items',
  validate(cartValidation),
  cartController.addItem
);
router.put('/items/:itemId',
  validate([...cartValidation]),
  cartController.updateQuantity
);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);
module.exports = router;