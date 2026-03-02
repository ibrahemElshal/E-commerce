const { Order, OrderItem, Cart, Product, User } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
class OrderService {
    async checkout(userId, shippingAddress, currentUser) {
        const transaction = await sequelize.transaction();
        try {
            const cartItems = await Cart.findAll({
                where: { userId },
                include: [Product],
                transaction
            });
            if (cartItems.length === 0) {
                throw new BadRequestError('Cart is empty');
            }
            let totalAmount = 0;
            for (const item of cartItems) {
                if (item.Product.quantity < item.quantity) {
                    throw new BadRequestError(`Insufficient stock for ${item.Product.name}`);
                }
                totalAmount += item.quantity * parseFloat(item.priceAtTime);
            }
            const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            const order = await Order.create({
                orderNumber,
                customerId: userId, // Fixed relation to match model schema
                totalAmount,
                status: 'pending',
                shippingAddress: shippingAddress || currentUser?.shippingAddress || 'No Address Provided',
                expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }, { transaction });

            for (const item of cartItems) {
                await OrderItem.create({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtTime: item.priceAtTime
                }, { transaction });
            }

            // Generate Payment Intent from Stripe
            const paymentService = require('./paymentService');
            const paymentIntent = await paymentService.createPaymentIntent(totalAmount, order.id, currentUser.email);

            // Save Payment Intent ID to the Order
            order.paymentIntentId = paymentIntent.id;
            await order.save({ transaction });

            await transaction.commit();

            return {
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    totalAmount: order.totalAmount,
                    status: order.status
                },
                clientSecret: paymentIntent.client_secret
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async handlePaymentSuccess(paymentIntentId) {
        const transaction = await sequelize.transaction();
        try {
            const order = await Order.findOne({
                where: { paymentIntentId },
                include: [{ model: OrderItem }],
                transaction
            });

            if (!order) {
                throw new NotFoundError('Order not found for matching Payment Intent');
            }

            if (order.status !== 'pending') {
                // Prevent double processing
                await transaction.rollback();
                return order;
            }

            // Decrement stock for all items
            for (const item of order.OrderItems) {
                await Product.decrement('quantity', {
                    by: item.quantity,
                    where: { id: item.productId },
                    transaction
                });
            }

            // Clear the User's cart
            await Cart.destroy({
                where: { userId: order.customerId }, // Note: using customerId
                transaction
            });

            // Mark the order as Paid / Processing
            order.status = 'processing';
            order.paidAt = new Date();
            await order.save({ transaction });

            await transaction.commit();
            return order;
        } catch (error) {
            await transaction.rollback();
            console.error('Webhook processing error for paymentIntent:', paymentIntentId, error);
            throw error;
        }
    }

    async getUserOrders(userId, page = 1, limit = 10, status) {
        const offset = (page - 1) * limit;
        const where = { userId };
        if (status) {
            where.status = status;
        }
        const orders = await Order.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });
        return {
            total: orders.count,
            page: parseInt(page),
            totalPages: Math.ceil(orders.count / limit),
            data: orders.rows
        };
    }
    async getOrderById(id, currentUser) {
        const order = await Order.findByPk(id, {
            include: [{
                model: OrderItem,
                include: [Product]
            }, {
                model: User,
                attributes: ['id', 'name', 'email', 'role']
            }]
        });
        if (!order) {
            throw new NotFoundError('Order not found');
        }
        if (currentUser.role !== 'admin' && order.userId.toString() !== currentUser.id.toString()) {
            throw new ForbiddenError('Access denied');
        }
        return order;
    }
    async updateStatus(id, status, currentUser) {
        if (currentUser.role !== 'admin') {
            throw new ForbiddenError('Access denied. Admin only.');
        }
        const order = await Order.findByPk(id);
        if (!order) {
            throw new NotFoundError('Order not found');
        }
        if (status === 'completed' && !order.actualDeliveryDate) {
            order.actualDeliveryDate = new Date();
        }
        order.status = status;
        await order.save();
        return order;
    }
    async listAllOrders(page = 1, limit = 10, status, startDate, endDate, userId, currentUser) {
        if (currentUser.role !== 'admin') {
            throw new ForbiddenError('Access denied. Admin only.');
        }
        const offset = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (userId) {
            where.userId = userId;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt[Op.gte] = new Date(startDate);
            if (endDate) where.createdAt[Op.lte] = new Date(endDate);
        }
        const orders = await Order.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                attributes: ['id', 'name', 'email', 'role']
            }]
        });
        return {
            total: orders.count,
            page: parseInt(page),
            totalPages: Math.ceil(orders.count / limit),
            data: orders.rows
        };
    }
    async getDelayedOrders(currentUser) {
        if (currentUser.role !== 'admin') {
            throw new ForbiddenError('Access denied. Admin only.');
        }
        const now = new Date();
        const orders = await Order.findAll({
            where: {
                status: { [Op.notIn]: ['completed', 'cancelled'] },
                expectedDeliveryDate: { [Op.lt]: now }
            },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }]
        });
        return orders;
    }
}
module.exports = new OrderService();
