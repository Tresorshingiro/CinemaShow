const express = require('express')
const { getNowPlayingMovies, addShow, getShows, getShow } = require('../controllers/showController')
const { protectAdmin } = require('../middleware/auth')

const router = express.Router()

router.get('/now-playing', protectAdmin, getNowPlayingMovies)
router.post('/add', protectAdmin, addShow)
router.get('/all', getShows)
router.get("/:movieId", getShow)

module.exports = router