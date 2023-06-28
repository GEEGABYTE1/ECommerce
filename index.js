const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const PORT = 3001
const db = require('./queries')

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)


app.get('/', db.getStores)
app.get('/items', db.getItems)
app.get('/customers', db.getCustomers)
app.post('/customer/signin/:username/:password', db.signIn)

app.listen(PORT, () => {
    console.log(`Listening on PORT: ${PORT}`)
})