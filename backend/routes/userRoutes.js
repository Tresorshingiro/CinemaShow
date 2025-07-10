const express = require('express')
const { getUserBookings, updateFavorite, getFavorites } = require('../controllers/userController')

const router = express.Router()

router.get('/booking', getUserBookings)
router.post('/update-favorite', updateFavorite)
router.get('/favorites', getFavorites)

module.exports = router