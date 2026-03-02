const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validate, productValidation } = require('../middleware/validation');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
router.get('/', productController.list);
router.get('/:id', productController.getById);
router.post('/', 
  authenticate,
  authorizeAdmin, 
  validate(productValidation),
  productController.create
);
router.put('/:id',
  authenticate,
  authorizeAdmin, 
  validate(productValidation),
  productController.update
);
router.delete('/:id',
  authenticate,
  authorizeAdmin, 
  productController.delete
);
module.exports = router;