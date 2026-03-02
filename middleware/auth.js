const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      throw new Error();
    }
    req.user = user; 
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin only.' });
  }
};
const authorizeUserOrAdmin = (req, res, next) => {
  const userId = req.params.id || req.body.userId;
  if (req.user.role === 'admin' || req.user.id === userId) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied.' });
  }
};
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};
module.exports = { 
  authenticate, 
  authorizeAdmin, 
  authorizeUserOrAdmin, 
  generateToken 
};