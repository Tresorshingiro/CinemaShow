const Booking = require("../models/Booking")
const Show = require("../models/Show")
const User = require("../models/User")


//API to check if user is admin
const isAdmin = async (req, res) => {
    res.json({success: true, isAdmin: true})
}

//API to get dashboard data
const getDashboardData = async (req, res) => {
    try{
        const bookings = await Booking.find({isPaid: true})
        const activeShows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie')

        const totalUser = await User.countDocuments()

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking)=> acc + booking.amount, 0),
            activeShows,
            totalUser
        }
        res.json({success: true, dashboardData})
    } catch(error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//API to get all shows
const getAllShows = async (req, res) => {
    try{
        const shows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({showDateTime: 1})
        res.json({success: true, shows})
    } catch(error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

const getAllBookings = async (req, res) => {
    try{
        const bookings = await Booking.find({}).populate('user').populate({path: 'show',
            populate: {path: 'movie'}}).sort({createdAt: -1})
        res.json({success: true, bookings})
    } catch(error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

module.exports = {
    isAdmin,
    getDashboardData,
    getAllShows,
    getAllBookings
}