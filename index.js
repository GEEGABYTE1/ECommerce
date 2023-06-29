const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const bcrypt = require('bcrypt')
const db = require('./queries')





const PORT = 3000

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// get requests 
app.get('/', (req, res) => {
    res.render('index.ejs')
})
app.get('/stores', db.getStores)


//testing other API Routes routes
app.post('/stores/:store_items/:item_stock/:item_cost', db.updateStore)









app.listen(PORT, () => {
    console.log(`Server is Running on Port: ${PORT}`)
})