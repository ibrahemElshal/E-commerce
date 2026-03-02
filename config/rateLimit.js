const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;

const createLimiters = (redisClient) => {
    const store = new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    });

    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        store,
        message: { error: 'Too many requests, please try again later.' }
    });

    const authLimiter = rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        store,
        message: { error: 'Too many authentication attempts, please try again after an hour.' }
    });

    const checkoutLimiter = rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        store,
        message: { error: 'Too many checkout attempts.' }
    });

    return { apiLimiter, authLimiter, checkoutLimiter };
};

module.exports = createLimiters;
