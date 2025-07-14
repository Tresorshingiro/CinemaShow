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

//inngest function to send reminders
const sendShowReminders = inngest.createFunction(
    {id: 'send-show-reminders'},
    {cron: "0 */8 * * *"}, // Every 8 hours
    async ({step})=>{
        const now = new Date();
        const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

        //prepare reminder tasks
        const reminderTasks = await step.run("prepare-reminder-tasks", async ()=>{
            const shows = await Show.find({
                showTime: {$gte: windowStart, $lt: in8Hours},
            }).populate('movie');

            const tasks = [];

            for(const show of shows){
                if(!show.movie || !show.occupiedSeats) continue;

                const userIds = [...new set(Object.values(show.occupiedSeats))];
                if(userIds.length === 0) continue;

                const users = await User.find({_id: {$in: userIds}}).select("name email");

                for(const user of users){
                    tasks.push({
                        userEmail: user.email,
                        userName: user.name,
                        movieTitle: show.movie.title,
                        showTime: show.showTime,
                    })
                }
            }
            return tasks;
        })

        if(reminderTasks.length === 0) {
            return {sent: 0, message: "No reminders to send."}
        }

        // send reminder emails
        const results = await step.run('send=all-reminders', async ()=>{
            return await Promise.allSettled(
                reminderTasks.map(task => sendEmail({
                    to: task.userEmail,
                    subject: `Reminder: Your movie "${task.movieTitle}" starts soon!`,
                    body: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
                            <h2>Hi ${task.userName},</h2>
                            <p>This is a friendly reminder that your movie <strong style="color: #F84565;">"${task.movieTitle}"</strong> starts at ${new Date(task.showTime).toLocaleTimeString('en-us', { timeZone: 'Africa/Kigali' })}.</p>
                            <p>Enjoy the show! 🍿</p>
                            <p>Thanks for booking with us!<br/>- CinemaShow Team</p>
                          </div>`
                }))
            )
        })
        
        const sent = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.length - sent;

        return {
            sent,
            failed,
            message: `Sent ${sent} reminder(s), ${failed} failed.`
        }
    }
)

const sendNewShowNotifications = inngest.createFunction(
    {id: "send-new-show-notifications"},
    {event: "app/show.created"},
    async ({event}) => {
        const { movieTitle } = event.data;

        const users = await User.find({})

        for( const user of users){
            const userEmail = user.email;
            const userName = user.name;

            const subject = `🎬 New Show Added: ${movieTitle}`;
            const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                     <h2>Hi ${userName},</h2>
                        <p>We are excited to announce a new show for the movie <strong style="color: #F84565;">"${movieTitle}"</strong>!</p>
                        <p>Visit our website</p>
                        <br/>
                        <p>Thanks, <br/>- CinemaShow Team</p>
              
            </div>`;

            await sendEmail({
            to: userEmail,
            subject,
            body,
        })
        }

        return {message: "Notification sent."}
    }
)

const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndCancelBooking,
    sendBookingConfirmationEmail,
    sendShowReminders,
    sendNewShowNotifications
];

module.exports = { inngest, functions };