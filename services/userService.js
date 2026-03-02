const { User } = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } = require('../utils/errors');
class UserService {
    async register(userData) {
        if (userData.role === 'admin') {
            userData.role = 'user';
        }
        const user = await User.create(userData);
        const token = generateToken(user);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                shippingAddress: user.shippingAddress
            },
            token
        };
    }
    async login(email, password) {
        const user = await User.findOne({ where: { email } });
        if (!user || !(await user.validatePassword(password))) {
            throw new UnauthorizedError('Invalid credentials');
        }
        if (!user.isActive) {
            throw new UnauthorizedError('Account is deactivated');
        }
        const token = generateToken(user);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                shippingAddress: user.shippingAddress
            },
            token
        };
    }
    async update(id, updateData, currentUser) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        if (updateData.role && currentUser.role !== 'admin') {
            delete updateData.role;
        }
        delete updateData.email;
        await user.update(updateData);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            shippingAddress: user.shippingAddress
        };
    }
    async delete(id, currentUser) {
        if (currentUser.role !== 'admin' && currentUser.id.toString() !== id.toString()) {
            throw new ForbiddenError('Access denied');
        }
        const user = await User.findByPk(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        await user.update({ isActive: false });
    }
    async list(page = 1, limit = 10, role, currentUser) {
        if (currentUser.role !== 'admin') {
            throw new ForbiddenError('Access denied. Admin only.');
        }
        const offset = (page - 1) * limit;
        const where = { isActive: true };
        if (role) {
            where.role = role;
        }
        const users = await User.findAndCountAll({
            where,
            attributes: ['id', 'name', 'email', 'role', 'shippingAddress', 'registrationDate'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['registrationDate', 'DESC']]
        });
        return {
            total: users.count,
            page: parseInt(page),
            totalPages: Math.ceil(users.count / limit),
            data: users.rows
        };
    }
    async getProfile(currentUser) {
        return {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            shippingAddress: currentUser.shippingAddress,
            registrationDate: currentUser.registrationDate
        };
    }
    async getById(id, currentUser) {
        if (currentUser.role !== 'admin') {
            throw new ForbiddenError('Access denied. Admin only.');
        }
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'email', 'role', 'shippingAddress', 'registrationDate', 'isActive']
        });
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user;
    }
    async changeRole(id, role, currentUser) {
        if (currentUser.role !== 'admin') {
            throw new ForbiddenError('Access denied. Admin only.');
        }
        if (!['admin', 'user'].includes(role)) {
            throw new BadRequestError('Invalid role');
        }
        const user = await User.findByPk(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        if (user.role === 'admin' && currentUser.id.toString() === user.id.toString()) {
            throw new BadRequestError('Cannot change your own admin role');
        }
        user.role = role;
        await user.save();
        return {
            message: 'User role updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }
}
module.exports = new UserService();
