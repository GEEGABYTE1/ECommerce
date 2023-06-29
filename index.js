const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const db = require('./queries')





const PORT = 3000

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

// get requests 
app.get('/', (req, res) => {
    res.render('index.ejs')
})
app.get('/register', (req, res) => {
    return res.render('register.ejs')
})
app.get('/login', (req, res) => {
    res.render('login.ejs')
})
app.get('/stores', db.getStores)


//testing other API Routes routes
app.post('/stores/:store_items/:item_stock/:item_cost', db.updateStore)
app.post('/register', db.SignUp)








app.listen(PORT, () => {
    console.log(`Server is Running on Port: ${PORT}`)
})