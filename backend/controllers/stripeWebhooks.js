const {stripe} = require('stripe');
const Booking = require('../models/Booking');
const { inngest } = require('../inngest');

const stripewebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];

    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log(`Received event: ${event.type}`);  
    } catch(error) {
        console.error('Webhook signature verification failed:', error);
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                });

                const session = sessionList.data[0]
                const { bookingId } = session.metadata

                await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentLink: ""
                })

                break;
            }

            default: 
                console.log('Unhandled event type:', event.type);
        }
        
        response.json({ received: true });
    } catch(error) {
        console.error("Webhook processing error:", error);
        response.status(500).send("Internal Server Error");
    }
};

module.exports = { stripewebhooks };