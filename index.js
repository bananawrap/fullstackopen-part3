const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(morgan((tokens, req, res) => [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
].join(' ')))

let contacts = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    },
    {
        name: "ada",
        number: "13",
        id: 5
    }
]

const generateId = () => {
    const maxId = contacts.length > 0
        ? Math.max(...contacts.map(n => n.id))
        : 0
    return maxId + 1
}

app.get('/api/contacts', (req, res) => {
    res.json(contacts)
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

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})