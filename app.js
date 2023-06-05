const config = require("./utils/config")
const express = require("express")
const cors = require("cors")
const app = express()
const logger = require("./utils/logger")
const contactsRouter = require("./controllers/contacts")
const middleware = require("./utils/middleware")
const mongoose = require("mongoose")

mongoose.set("strictQuery",false)

logger.info("connecting to MongoDB")

mongoose.connect(config.MONGODB_URL)
    .then(() => {
        logger.info("connected to MongoDB")
    })
    .catch((error) => {
        logger.info("error connecting to MongoDB: ", error.message)
    })

app.use(cors())
app.use(express.static("build"))
app.use(express.json())
app.use(middleware.requestLogger)


app.use("/api/contacts", contactsRouter)


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app