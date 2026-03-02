const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Customers',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  expectedDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['orderNumber']
    },
    {
      fields: ['customerId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    }
  ]
});
const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  priceAtTime: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});
module.exports = { Order, OrderItem };