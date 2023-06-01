require("dotenv").config()
const Contact = require("./models/contact")
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const app = express()

app.use(express.static("build"))
app.use(express.json())
app.use(morgan((tokens, req, res) => [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"), "-",
    tokens["response-time"](req, res), "ms",
    JSON.stringify(req.body)
].join(" ")))
app.use(cors())


app.get("/api/contacts", (req, res, next) => {
    Contact.find({}).then(contacts => {
        res.json(contacts)
    })
        .catch(error => next(error))
})

app.get("/api/contacts/:id", (req, res, next) => {
    Contact.findById(req.params.id)
        .then(contact => {
            if (contact) {
                res.json(contact)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete("/api/contacts/:id", (req, res, next) => {
    Contact.findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(error => next(error))
})


app.post("/api/contacts", (req, res, next) => {
    const body = req.body

    if (body.name === undefined || body.number === undefined) {
        return res.status(400).json({
            error: "missing fields"
        })
    }

    const contact = new Contact({
        name: body.name,
        number: body.number,
    })

    contact.save().then(savedContact => {
        res.json(savedContact)
    })
        .catch(error => next(error))
})

app.put("/api/contacts/:id", (req, res, next) => {
    const body = req.body

    const contact = {
        name: body.name,
        number: body.number,
    }
    Contact.findByIdAndUpdate(req.params.id, contact, { new: true, runValidators: true, context: "query" })
        .then(updatedContact => {
            res.json(updatedContact)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" })
}

app.get("/info", (req, res) => {
    res.send(`
        <div>
        <p>Phonebook has info for ${Contact.length} people</p>
        <p>${Date()}</p>
        </div>
    `)
})

app.use(unknownEndpoint)


const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === "CastError") {
        return res.status(400).send({ error: "malformatted id" })
    } else if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})