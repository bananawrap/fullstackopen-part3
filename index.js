const mongoose = require('mongoose')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan((tokens, req, res) => [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
].join(' ')))

const url = process.env.MONGODB_URL
mongoose.set('strictQuery',false)
mongoose.connect(url)

const contactSchema = new mongoose.Schema({
    name: String,
    number: String,
})

contactSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject._v
    }
})

const Contact = mongoose.model('Contact', contactSchema)

const generateId = () => {
    const maxId = contacts.length > 0
        ? Math.max(...contacts.map(n => n.id))
        : 0
    return maxId + 1
}

app.get('/api/contacts', (req, res) => {
    Contact.find({}).then(contacts => {
        res.json(contacts)
    })
})

app.get('/api/contacts/:id', (req, res) => {
    const id = Number(req.params.id)
    const contact = contacts.find(contact => contact.id === id)

    contact ? res.json(contact) :
        res.status(404).end()
})

app.delete('/api/contacts/:id', (req, res) => {
    const id = Number(req.params.id)
    contacts = contacts.filter(contact => contact.id !== id)

    res.status(204).end()
})


app.post('/api/contacts', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'missing fields'
        })
    }
    else if (contacts.some(contact => contact.name.trim().toUpperCase() === body.name.trim().toUpperCase())) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    const contact = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    contacts = contacts.concat(contact)

    res.json(contact)
})

app.get('/info', (req, res) => {
    res.send(`
        <div>
        <p>Phonebook has info for ${contacts.length} people</p>
        <p>${Date()}</p>
        </div>
    `)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})