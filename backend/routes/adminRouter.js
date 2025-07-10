const express = require('express')
const { protectAdmin } = require('../middleware/auth')
const { isAdmin, getDashboardData, getAllShows, getAllBookings } = require('../controllers/adminController')

const router = express.Router()

router.get('/is-admin', protectAdmin, isAdmin)
router.get('/dashboard', protectAdmin, getDashboardData)
router.get('/all-shows', protectAdmin, getAllShows)
router.get('/all-bookings', protectAdmin, getAllBookings)

module.exports = router
