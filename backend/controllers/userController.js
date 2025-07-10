const Booking = require("../models/Booking");
const {clerkMiddleware, clerkClient} = require('@clerk/express');
const Movie = require("../models/Movie");

const getUserBookings = async(req, res) => {
    try{
        const user = req.auth().userId;
        
        const bookings = await Booking.find({user}).populate({path: "show", populate: {path: "movie"}}).sort({createdAt: -1});
        res.json({success: true, bookings});
     } catch(error){
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

//API controller to update favorite movie in clerk user Metadata
const updateFavorite = async(req, res) => {
    try{
        const {movieId} = req.body
        const userId = req.auth().userId;
        
        const user = await clerkClient.users.getUser(userId)
        if(!user.privateMetadata.favorites){
            user.privateMetadata.favorites = [];
        }
        
        if(!user.privateMetadata.favorites.includes(movieId)){
            user.privateMetadata.favorites.push(movieId);
        }else{
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId)
        }
            
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: user.privateMetadata
        });
        res.json({success: true, message: "Favorite movies updated"});
     } catch(error){
        console.log(error)
        res.json({success: false, message: error.message});
    }
}

const getFavorites = async(req, res) => {
    try{
        const user = await clerkClient.users.getUser(req.auth().userId)
        const favorites = user.privateMetadata.favorites
        
        const movies = await Movie.find({_id: {$in: favorites}})
        res.json({success: true, movies})
     } catch(error){
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

module.exports = {
    getUserBookings,
    updateFavorite,
    getFavorites
}