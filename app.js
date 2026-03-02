const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('redis');
const sequelize = require('./config/database');
const createLimiters = require('./config/rateLimit');
const errorHandler = require('./middleware/errorHandler');

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
    try {
        const redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        redisClient.on('error', (err) => console.log('Redis Client Error', err));
        await redisClient.connect();
        console.log('Redis connected successfully.');

        const { apiLimiter, authLimiter, checkoutLimiter } = createLimiters(redisClient);

        app.use('/api/', apiLimiter);
        app.use('/api/users/login', authLimiter);
        app.use('/api/users/register', authLimiter);
        app.use('/api/orders/checkout', checkoutLimiter);

        app.use('/api/products', productRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/cart', cartRoutes);
        app.use('/api/orders', orderRoutes);

        app.get('/health', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date() });
        });

        app.use(errorHandler);

        await sequelize.authenticate();
        console.log('Database connected successfully.');

        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('Database synced.');

            const { User } = require('./models');
            const adminExists = await User.findOne({ where: { role: 'admin' } });
            if (!adminExists) {
                await User.create({
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'admin123',
                    role: 'admin',
                    shippingAddress: 'Admin Address'
                });
                console.log('Default admin created: admin@example.com / admin123');
            }
        }

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;