const cartService = require('../services/cartService');
const cartController = {
  async addItem(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const result = await cartService.addItem(req.user.id, productId, quantity);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
  async removeItem(req, res, next) {
    try {
      await cartService.removeItem(req.user.id, req.params.itemId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  async updateQuantity(req, res, next) {
    try {
      const { quantity } = req.body;
      const result = await cartService.updateQuantity(req.user.id, req.params.itemId, quantity);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async viewCart(req, res, next) {
    try {
      const result = await cartService.viewCart(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async clearCart(req, res, next) {
    try {
      await cartService.clearCart(req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};
module.exports = cartController;