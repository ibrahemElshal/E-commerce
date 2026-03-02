const { body, validationResult } = require('express-validator');
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ errors: errors.array() });
  };
};
const productValidation = [
  body('name').isLength({ min: 2, max: 100 }).trim(),
  body('price').isFloat({ min: 0 }),
  body('sku').isAlphanumeric().isLength({ min: 3, max: 20 }),
  body('quantity').isInt({ min: 0 }),
  body('category').notEmpty().trim()
];
const userValidation = [
  body('name').isLength({ min: 2, max: 50 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('shippingAddress').optional().trim().escape()
];
const cartValidation = [
  body('productId').isUUID(),
  body('quantity').isInt({ min: 1 })
];
module.exports = {
  validate,
  productValidation,
  userValidation,
  cartValidation
};