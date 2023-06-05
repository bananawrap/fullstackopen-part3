const contactsRouter = require("express").Router()
const Contact = require("../models/contact")

contactsRouter.get("/", (req, res, next) => {
    Contact.find({}).then(contacts => {
        res.json(contacts)
    })
        .catch(error => next(error))
})

contactsRouter.get("/:id", (req, res, next) => {
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

contactsRouter.delete("/:id", (req, res, next) => {
    Contact.findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(error => next(error))
})


contactsRouter.post("/", (req, res, next) => {
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

contactsRouter.put("/:id", (req, res, next) => {
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


contactsRouter.get("/info", (req, res) => {
    res.send(`
        <div>
        <p>Phonebook has info for ${Contact.length} people</p>
        <p>${Date()}</p>
        </div>
    `)
})

module.exports = contactsRouter