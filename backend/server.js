require ('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const {clerkMiddleware} = require('@clerk/express')
const {serve} = require('inngest/express')
const {inngest, functions} = require('./inngest/index')
const showRouter = require('./routes/showRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const adminRouter = require('./routes/adminRouter')
const userRouter = require('./routes/userRoutes')
const { stripewebhooks } = require('./controllers/stripeWebhooks')

const app = express()

app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())

//Stripe Webhooks Route
app.use('/api/stripe', express.raw({type: 'application/json'}), stripewebhooks)

//API Routes
app.use('/api/inngest', serve({ client: inngest, functions }))
app.use('/api/show', showRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)



mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Connected to DB and Listening on port', process.env.PORT)
        })
      })
      .catch((error) => {
        console.log(error)
      })