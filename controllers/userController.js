const userService = require('../services/userService');
const userController = {
  async register(req, res, next) {
    try {
      const result = await userService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const result = await userService.update(req.params.id, req.body, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    try {
      await userService.delete(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  async list(req, res, next) {
    try {
      const { page, limit, role } = req.query;
      const result = await userService.list(page, limit, role, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async getProfile(req, res, next) {
    try {
      const result = await userService.getProfile(req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async getById(req, res, next) {
    try {
      const result = await userService.getById(req.params.id, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  async changeRole(req, res, next) {
    try {
      const { role } = req.body;
      const result = await userService.changeRole(req.params.id, role, req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
module.exports = userController;