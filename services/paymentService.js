const Stripe = require('stripe');

class PaymentService {
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
    }

    /**
     * Creates a Stripe Payment Intent for a given order amount.
     * @param {number} amount - The amount in the smallest currency unit (e.g. cents).
     * @param {string} orderId - The Order ID reference.
     * @param {string} userEmail - The email of the customer.
     * @returns {Promise<Stripe.PaymentIntent>}
     */
    async createPaymentIntent(amount, orderId, userEmail) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'usd',
                receipt_email: userEmail,
                metadata: {
                    orderId: orderId.toString()
                }
            });
            return paymentIntent;
        } catch (error) {
            console.error('Stripe Payment Intent Error:', error);
            throw new Error('Failed to create payment intent with Stripe');
        }
    }

    /**
     * Reconstructs the raw webhook payload.
     */
    constructEvent(rawBody, signature) {
        return this.stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    }
}

module.exports = new PaymentService();
