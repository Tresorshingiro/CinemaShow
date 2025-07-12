const { Inngest } = require('inngest');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { sendEmail } = require('../configs/nodeMailer');

const inngest = new Inngest({ id: 'movie-ticket-booking' });


const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event}) => {
        const {id, first_name, last_name, email_addresses, image_url} = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + " " + last_name,
            image: image_url
        }
        await User.create(userData)
    }
)

//delete user in database
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-with-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event}) => {
        const {id} = event.data
        await User.findByIdAndDelete(id)
    }
)

//update user in database
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event}) => {
        const {id, first_name, last_name, email_addresses, image_url} = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + " " + last_name,
            image: image_url
        }
        await User.findByIdAndUpdate(id, userData)
    }
)

//Ingest Function to cancel booking after 10 minutes of booking if payment not made
const releaseSeatsAndCancelBooking = inngest.createFunction(
    {id: 'release-seats-delete-booking'},
    {event: 'app/checkpayment'},
    async ({event, step })=> {
        const threeHoursLater = new Date(Date.now() + 3 * 60 * 60 * 1000);
        await step.sleepUntil('wait-for-3-hours', threeHoursLater);

        await step.run('check-payment-status', async ()=> {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId)

            //if payment is nt made, release seats and delete booking
            if(!booking.isPaid){
               const show = await Show.findById(booking.show)
               booking.bookedSeats.forEach((seat)=>{
                delete show.occupiedSeats[seat]
               });
               show.markModified('occupiedSeats');
                await show.save();
                await Booking.findByIdAndDelete(booking._id); 
            }
        })
    }
)

// Inngest function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
    {
        id: 'send-booking-confirmation-email'
    },
    {event: 'app/show.booked'},
    async ({event, step})=> {
        const { bookingId } = event.data;

        const booking = await Booking.findById(bookingId).populate({path: 'show', populate: {path: 'movie', model: 'Movie'}}).populate('user');

        await sendEmail({
            to: booking.user.email,
            subject: `Booking Confirmation: "${booking.show.movie.title}" booked!`,
            body:`<div style="font-family: Arial, sans-serif; line-height: 1.5;">
                    <h2>Hi ${booking.user.name},</h2>
                    <p>Your booking for <strong style="color: #F84565;">"${booking.show.movie.title}"</strong> is confirmed. </p>
                    <p>
                      <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString('en-us', { timeZone: 'Africa/Kigali' })} <br/>
                      <strong>Time:</strong> ${new Date(booking.show.showshowDateTime).toLocaleDateString('en-us', { timeZone: 'Africa/Kigali' })}
                    </p>
                    <p>Enjoy the show! 🍿</p>
                    <p>Thanks for booking with us!<br/>- CinemaShow Team</p>
                  </div>`
        })
    }
)

const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndCancelBooking,
    sendBookingConfirmationEmail
];

module.exports = { inngest, functions };