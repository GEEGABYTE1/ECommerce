const express = require('express')
const db = require('./queries')
const app = express()

const PORT = 3000;


app.get('/', db.getStores)
app.get('/items', db.getItems)
app.get('/customers', db.getCustomers)

app.listen(PORT, () => {
    console.log(`Listening on PORT: ${PORT}`)
})