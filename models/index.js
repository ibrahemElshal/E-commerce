const Product = require('./Product.js');
const User = require('./User'); 
const Cart = require('./Cart');
const { Order, OrderItem } = require('./Order');
User.hasMany(Cart, { foreignKey: 'userId' }); 
Cart.belongsTo(User, { foreignKey: 'userId' }); 
Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Order, { foreignKey: 'userId' }); 
Order.belongsTo(User, { foreignKey: 'userId' }); 
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
module.exports = {
  Product,
  User, 
  Cart,
  Order,
  OrderItem
};