const { Order, OrderItem, Product, Customer } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const reportService = {
  async getSalesReport(startDate, endDate) {
    const orders = await Order.findAll({
      where: {
        status: 'completed',
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const productSales = {};
    orders.forEach(order => {
      order.OrderItems.forEach(item => {
        if (!productSales[item.Product.name]) {
          productSales[item.Product.name] = {
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.Product.name].quantity += item.quantity;
        productSales[item.Product.name].revenue += item.quantity * parseFloat(item.priceAtTime);
      });
    });
    return {
      period: { startDate, endDate },
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue
      },
      topProducts: Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
    };
  },
  async getLastMonthOverdueOrders() {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return await Order.findAll({
      where: {
        status: { [Op.notIn]: ['completed', 'cancelled'] },
        expectedDeliveryDate: {
          [Op.lt]: new Date(),
          [Op.gte]: lastMonth
        }
      },
      include: [{
        model: Customer,
        attributes: ['id', 'name', 'email']
      }]
    });
  },
  async getLastMonthOrders() {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return await Order.findAll({
      where: {
        createdAt: {
          [Op.gte]: lastMonth
        }
      },
      include: [{
        model: OrderItem,
        include: [Product]
      }, {
        model: Customer,
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
  }
};
module.exports = reportService;