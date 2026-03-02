const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validate, userValidation } = require('../middleware/validation');
const { authenticate, authorizeAdmin, authorizeUserOrAdmin } = require('../middleware/auth');
router.post('/register',
  validate(userValidation),
  userController.register
);
router.post('/login', userController.login);
router.get('/profile', authenticate, userController.getProfile);
router.put('/:id', 
  authenticate, 
  authorizeUserOrAdmin, 
  userController.update
);
router.delete('/:id', 
  authenticate, 
  userController.delete 
);
router.get('/', 
  authenticate, 
  authorizeAdmin, 
  userController.list
);
router.get('/:id', 
  authenticate, 
  authorizeAdmin, 
  userController.getById
);
router.patch('/:id/role',
  authenticate,
  authorizeAdmin, 
  userController.changeRole
);
module.exports = router;