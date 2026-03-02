const orderService = require('../services/orderService');
const orderController = {
  async checkout(req, res, next) {
    try {
      const { shippingAddress } = req.body;
      const result = await orderService.checkout(req.user.id, shippingAddress, req.user.shippingAddress);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
  async getUserOrders(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await orderService.getUserOrders(req.user.id, page, limit, status);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async getOrderById(req, res, next) {
    try {
      const result = await orderService.getOrderById(req.params.id, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const result = await orderService.updateStatus(req.params.id, status, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async listAllOrders(req, res, next) {
    try {
      const { page, limit, status, startDate, endDate, userId } = req.query;
      const result = await orderService.listAllOrders(page, limit, status, startDate, endDate, userId, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async getDelayedOrders(req, res, next) {
    try {
      const result = await orderService.getDelayedOrders(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
module.exports = orderController;