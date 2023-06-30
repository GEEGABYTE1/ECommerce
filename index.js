const express = require('express')
const db = require('./queries')
const flash = require('express-flash')
const bodyParser = require('body-parser')
const app = express()

const session = require('express-session')
const store = new session.MemoryStore()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')




const PORT = 3000
app.use(session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: false,
    store
}))

app.use(flash())
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname + "/public"));

app.use(passport.initialize())
app.use(passport.session())


passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    db.pool.query('SELECT * FROM customer WHERE id = $1', [id], function(err, row) {
        if (err) {
            return done(err)
        } else {
            done(null, row.rows[0])
        }
    })
})

passport.use(new LocalStrategy({ usernameField: 'email' }, function (email, password, cb) { // inputs 'email' and 'password' must follow .ejs ids

    console.log("in function>>>>>>>")
    console.log("Username in Strat: ", email )
    console.log("Password in Strat: ", password)
    db.pool.query('SELECT * FROM customer WHERE customer_email = $1', [email], async function(err, row) { // row holds the array of result
        
        if (err) {
            
            console.log(err)
            return cb(err);
        }
        if (!row) {
            
            console.log("Incorrect Email or Password")
            return cb(null, false, {message: 'Incorrect Email or Password'})
        } 
        try {
            if (await bcrypt.compare(password, row.rows[0]['customer_password'])) {
                return cb(null, row.rows[0]) // returns the user object from db
            } else {
                console.log("Row: ", row.rows[0])
                return cb(null, false)
            }

        } catch (err) {
            return cb(err)
        }



        
    } )
}))

// get requests 
app.get('/', (req, res) => {
    res.render('index.ejs', {user: req.row})

})
app.get('/register', (req, res) => {
    return res.render('register.ejs')
})
app.get('/login', (req, res) => {
    res.render('login.ejs')
})
app.get('/stores', db.getStores)

app.get('/success', (req, res) => {
    res.render('success.ejs')
})


// post requests
app.post('/login', passport.authenticate('local', {
    successRedirect: '/success',
    failureRedirect: '/register',
    failureFlash: true
})



)

//testing other API Routes routes
app.post('/stores/:store_items/:item_stock/:item_cost', db.updateStore)
app.post('/register', db.SignUp)

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err)
            next(err)
        } else {
            console.log('free')
        }
    });
    res.redirect("/");// redirect to home
  });







app.listen(PORT, () => {
    console.log(`Server is Running on Port: ${PORT}`)
})