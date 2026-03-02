const Stripe = require('stripe');

class PaymentService {
    constructor() {
        this.stripe = null;
    }

    getStripeClient() {
        if (this.stripe) return this.stripe;

        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) {
            throw new Error('STRIPE_SECRET_KEY is not defined');
        }

        this.stripe = new Stripe(secretKey, {
            apiVersion: '2023-10-16',
        });
        return this.stripe;
    }

    getWebhookSecret() {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
        }
        return webhookSecret;
    }

    
    async createPaymentIntent(amount, orderId, userEmail, idempotencyKey = null) {
        try {
            
            if (!amount || isNaN(amount) || Number(amount) <= 0) {
                throw new Error('Invalid payment amount');
            }

            if (!orderId) {
                throw new Error('Order ID is required');
            }

            if (!userEmail) {
                throw new Error('User email is required');
            }

            
            const cents = Math.round(Number(amount) * 100);

           
            const stripe = this.getStripeClient();
            const paymentIntent = await stripe.paymentIntents.create(
                {
                    amount: cents,
                    currency: 'usd',
                    receipt_email: userEmail,

                    automatic_payment_methods: {
                        enabled: true,
                    },

                    metadata: {
                        orderId: orderId.toString(),
                    },
                },
                idempotencyKey
                    ? { idempotencyKey }
                    : undefined
            );

            return paymentIntent;

        } catch (error) {
            console.error('Stripe Payment Intent Error:', error.message);
            throw error;
        }
    }

    constructEvent(rawBody, signature) {
        try {
            const stripe = this.getStripeClient();
            return stripe.webhooks.constructEvent(
                rawBody,
                signature,
                this.getWebhookSecret()
            );
        } catch (error) {
            console.error('Stripe Webhook Verification Failed:', error.message);
            throw new Error('Invalid Stripe webhook signature');
        }
    }
}

module.exports = new PaymentService();