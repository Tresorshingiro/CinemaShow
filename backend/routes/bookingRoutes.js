const express = require('express')
const { createBooking, getOccupiedSeats } = require('../controllers/bookingController')

const router = express.Router()

router.post('/create', createBooking)
router.get('/seats/:showId', getOccupiedSeats)

module.exports = router