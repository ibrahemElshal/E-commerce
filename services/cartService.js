const { Cart, Product } = require('../models');
const sequelize = require('../config/database');
const { NotFoundError, BadRequestError } = require('../utils/errors');
class CartService {
    async addItem(userId, productId, quantity) {
        const transaction = await sequelize.transaction();
        try {
            const product = await Product.findByPk(productId, { transaction });
            if (!product) {
                throw new NotFoundError('Product not found');
            }
            if (product.quantity < quantity) {
                throw new BadRequestError('Insufficient stock');
            }
            const existingItem = await Cart.findOne({
                where: { userId, productId },
                transaction
            });
            let cartItem;
            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity > product.quantity) {
                    throw new BadRequestError('Total quantity exceeds stock');
                }
                existingItem.quantity = newQuantity;
                await existingItem.save({ transaction });
                cartItem = existingItem;
            } else {
                cartItem = await Cart.create({
                    userId,
                    productId,
                    quantity,
                    priceAtTime: product.price
                }, { transaction });
            }
            await transaction.commit();
            const result = await Cart.findOne({
                where: { id: cartItem.id },
                include: [{
                    model: Product,
                    attributes: ['name', 'sku', 'price']
                }]
            });
            return result;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async removeItem(userId, itemId) {
        const deleted = await Cart.destroy({
            where: { id: itemId, userId }
        });
        if (!deleted) {
            throw new NotFoundError('Cart item not found');
        }
    }
    async updateQuantity(userId, itemId, quantity) {
        const transaction = await sequelize.transaction();
        try {
            const cartItem = await Cart.findOne({
                where: { id: itemId, userId },
                include: [Product],
                transaction
            });
            if (!cartItem) {
                throw new NotFoundError('Cart item not found');
            }
            if (cartItem.Product.quantity < quantity) {
                throw new BadRequestError('Insufficient stock');
            }
            cartItem.quantity = quantity;
            await cartItem.save({ transaction });
            await transaction.commit();
            return cartItem;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async viewCart(userId) {
        const cartItems = await Cart.findAll({
            where: { userId },
            include: [{
                model: Product,
                attributes: ['id', 'name', 'sku', 'price', 'quantity']
            }]
        });
        const subtotal = cartItems.reduce((sum, item) => {
            return sum + (item.quantity * parseFloat(item.Product.price));
        }, 0);
        return {
            items: cartItems,
            subtotal,
            itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        };
    }
    async clearCart(userId) {
        await Cart.destroy({
            where: { userId }
        });
    }
}
module.exports = new CartService();
