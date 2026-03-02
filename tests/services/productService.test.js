const productService = require('../../services/productService');
const { Product } = require('../../models/Product');
const { NotFoundError, ForbiddenError } = require('../../utils/errors');
const { Op } = require('sequelize');

jest.mock('../../models/Product', () => {
    return {
        Product: {
            create: jest.fn(),
            findByPk: jest.fn(),
            destroy: jest.fn(),
            findAndCountAll: jest.fn()
        }
    };
});

describe('ProductService', () => {
    const adminUser = { id: 1, role: 'admin' };
    const normalUser = { id: 2, role: 'customer' };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should successfully create a new product if admin', async () => {
            const productData = { name: 'Laptop', price: 999.99, quantity: 10 };
            const simulatedResponse = { id: 1, ...productData };

            Product.create.mockResolvedValue(simulatedResponse);

            const result = await productService.create(productData, adminUser);

            expect(Product.create).toHaveBeenCalledWith(productData);
            expect(result).toEqual(simulatedResponse);
        });

        it('should throw ForbiddenError if not admin', async () => {
            await expect(productService.create({}, normalUser)).rejects.toThrow(ForbiddenError);
        });
    });

    describe('getById', () => {
        it('should return a product when a valid id is provided', async () => {
            const mockProduct = { id: 1, name: 'Laptop', price: 999.99 };
            Product.findByPk.mockResolvedValue(mockProduct);

            const result = await productService.getById(1);

            expect(Product.findByPk).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockProduct);
        });

        it('should throw NotFoundError when product does not exist', async () => {
            Product.findByPk.mockResolvedValue(null);

            await expect(productService.getById(999)).rejects.toThrow(NotFoundError);
            expect(Product.findByPk).toHaveBeenCalledWith(999);
        });
    });

    describe('update', () => {
        it('should update a product successfully if admin', async () => {
            const mockProductInstance = {
                id: 1,
                name: 'Laptop',
                update: jest.fn().mockResolvedValue(true)
            };

            const updateData = { name: 'Gaming Laptop' };

            Product.findByPk.mockResolvedValue(mockProductInstance);

            const result = await productService.update(1, updateData, adminUser);

            expect(Product.findByPk).toHaveBeenCalledWith(1);
            expect(mockProductInstance.update).toHaveBeenCalledWith(updateData);
            expect(result).toBe(mockProductInstance);
        });

        it('should throw ForbiddenError if not admin', async () => {
            await expect(productService.update(1, {}, normalUser)).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError if updating a non-existent product', async () => {
            Product.findByPk.mockResolvedValue(null);
            await expect(productService.update(999, { name: 'New' }, adminUser)).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete a product successfully if admin', async () => {
            const mockProductInstance = {
                id: 1,
                destroy: jest.fn().mockResolvedValue(true)
            };

            Product.findByPk.mockResolvedValue(mockProductInstance);

            await productService.delete(1, adminUser);

            expect(Product.findByPk).toHaveBeenCalledWith(1);
            expect(mockProductInstance.destroy).toHaveBeenCalledTimes(1);
        });

        it('should throw ForbiddenError if not admin', async () => {
            await expect(productService.delete(1, normalUser)).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError when deleting non-existent product', async () => {
            Product.findByPk.mockResolvedValue(null);
            await expect(productService.delete(999, adminUser)).rejects.toThrow(NotFoundError);
        });
    });

    describe('list', () => {
        it('should return paginated list of products without filters', async () => {
            const mockResponse = {
                count: 2,
                rows: [{ id: 1, name: 'P1' }, { id: 2, name: 'P2' }]
            };

            Product.findAndCountAll.mockResolvedValue(mockResponse);

            const result = await productService.list(1, 10);

            expect(Product.findAndCountAll).toHaveBeenCalledWith({
                where: { isActive: true },
                limit: 10,
                offset: 0,
                order: [['createdAt', 'DESC']]
            });

            expect(result.total).toBe(2);
            expect(result.page).toBe(1);
            expect(result.totalPages).toBe(1);
            expect(result.data).toHaveLength(2);
        });

        it('should apply filters to the query', async () => {
            const mockResponse = { count: 0, rows: [] };
            Product.findAndCountAll.mockResolvedValue(mockResponse);

            await productService.list(2, 5, 'Electronics', 100, 500, 'Laptop');

            // Check if Op filters were correctly applied
            expect(Product.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    category: 'Electronics',
                    price: expect.objectContaining({
                        [Op.gte]: 100,
                        [Op.lte]: 500
                    })
                }),
                limit: 5,
                offset: 5
            }));
        });
    });
});
