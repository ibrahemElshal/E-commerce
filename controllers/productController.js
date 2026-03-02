const productService = require('../services/productService');
const productController = {
  async create(req, res, next) {
    try {
      const result = await productService.create(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const result = await productService.update(req.params.id, req.body, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    try {
      await productService.delete(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  async list(req, res, next) {
    try {
      const { page, limit, category, minPrice, maxPrice, search } = req.query;
      const result = await productService.list(page, limit, category, minPrice, maxPrice, search);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async getById(req, res, next) {
    try {
      const result = await productService.getById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
module.exports = productController;