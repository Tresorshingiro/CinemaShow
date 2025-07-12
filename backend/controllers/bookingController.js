const { inngest } = require("../inngest")
const Booking = require("../models/Booking")
const Show = require("../models/Show")
const {Stripe} = require('stripe')

//checking availabilty of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
    try{
        const showData = await Show.findById(showId)
        if(!showData){
            return false
        }

        const occupiedSeats = showData.occupiedSeats

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat])
        return !isAnySeatTaken

    } catch(error){
        console.log(error.message)
        return false
    }
}

const createBooking = async (req, res) => {
    try{
        const {userId} = req.auth()
        const {showId, selectedSeats} = req.body
        const {origin} = req.headers

        //check if the seat is available
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats)
        if(!isAvailable){
            return res.json({success: false, message: "Selected Seats are not available. "})
        }

        //get the show details
        const showData = await Show.findById(showId).populate('movie')

        //create new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        })

        selectedSeats.map((seat)=> {
            showData.occupiedSeats[seat] = userId
        })

        showData.markModified('occupiedSeats')
        await showData.save()

        //stripe Gateway
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY )

        //creating lines items for stripe
        const lineItems = [{
            price_data: {
                currency: 'rwf',
                product_data: {
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount) *100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: lineItems,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString(),
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 mins from now
        })

        booking.paymentLink = session.url
        await booking.save()

        //run Inngest function to check payment after 3 hours
        await inngest.send({
            name:"app/checkpayment",
            data: {
                bookingId: booking._id.toString()
            }
        })
        
        res.json({success: true, url: session.url})

    } catch(error){
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

const getOccupiedSeats = async (req, res) => {
    try{
        const {showId} = req.params
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)
        res.json({success: true, occupiedSeats})

    } catch(error){
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

module.exports = {
    checkSeatsAvailability,
    createBooking,
    getOccupiedSeats
}