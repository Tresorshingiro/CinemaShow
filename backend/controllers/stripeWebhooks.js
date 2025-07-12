const {stripe} = require('stripe');
const Booking = require('../models/Booking');
const { inngest } = require('../inngest');

const stripewebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];

    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log(`Received event: ${event.type}`);  // Added logging
    } catch(error) {
        console.error('Webhook signature verification failed:', error);
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                console.log('PaymentIntent:', paymentIntent.id);
                
                // Retrieve the checkout session
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                    limit: 1
                });

                if (!sessionList.data || sessionList.data.length === 0) {
                    console.error('No checkout session found for payment intent:', paymentIntent.id);
                    return response.status(400).send('No checkout session found');
                }

                const session = sessionList.data[0];
                console.log('Checkout session:', session.id);
                
                if (!session.metadata || !session.metadata.bookingId) {
                    console.error('No bookingId in session metadata');
                    return response.status(400).send('No bookingId in metadata');
                }

                const { bookingId } = session.metadata;
                console.log('Updating booking:', bookingId);

                // Update the booking
                const updatedBooking = await Booking.findByIdAndUpdate(
                    bookingId,
                    { isPaid: true, paymentLink: "" },
                    { new: true }  // Return the updated document
                );

                if (!updatedBooking) {
                    console.error('Booking not found:', bookingId);
                    return response.status(404).send('Booking not found');
                }

                console.log('Booking updated successfully:', updatedBooking._id);

                // Send confirmation email
                await inngest.send({
                    name: "app/show.booked",
                    data: { bookingId }
                });

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