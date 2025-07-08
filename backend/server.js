require ('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const {clerkMiddleware} = require('@clerk/express')
const {serve} = require('inngest/express')
const {inngest, functions} = require('./inngest/index')

const app = express()

app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())


//API Routes
app.use('/api/inngest', serve({ client: inngest, functions }))



mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Connected to DB and Listening on port', process.env.PORT)
        })
      })
      .catch((error) => {
        console.log(error)
      })