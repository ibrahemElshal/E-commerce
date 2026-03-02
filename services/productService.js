const { Product } = require('../models/Product');
const { Op } = require('sequelize');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
class ProductService {
    async create(productData, currentUser) {
        if (currentUser.role !== 'admin') {
            throw new ForbiddenError('Access denied. Admin only.');
        }
        const product = await Product.create(productData);
        return product;
    }
    async update(id, updateData, currentUser) {
        if (currentUser.role !== 'admin') {
            throw new ForbiddenError('Access denied. Admin only.');
        }
        const product = await Product.findByPk(id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }
        await product.update(updateData);
        return product;
    }
    async delete(id, currentUser) {
        if (currentUser.role !== 'admin') {
            throw new ForbiddenError('Access denied. Admin only.');
        }
        const product = await Product.findByPk(id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }
        await product.destroy();
    }
    async list(page = 1, limit = 10, category, minPrice, maxPrice, search) {
        const offset = (page - 1) * limit;
        const where = { isActive: true };
        if (category) {
            where.category = category;
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
        }
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }
        const products = await Product.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });
        return {
            total: products.count,
            page: parseInt(page),
            totalPages: Math.ceil(products.count / limit),
            data: products.rows
        };
    }
    async getById(id) {
        const product = await Product.findByPk(id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }
        return product;
    }
}
module.exports = new ProductService();
