// Begin: check env
if (process.env.NODE_ENV !== 'production') {
    // if not production build then use config from .env file
    require('dotenv').config() 
}
// for test only ---------------------------------------------
// using dotenv load .env file and get var from process.env.*
console.log(process.env.SESSION_SECRET);
if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = "test" // fix for test only
}
// -----------------------------------------------------------

// 0. load require dependencies
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash') // unused: for store and send msg
const session = require('express-session') 
const methodOverride = require('method-override')

const initPassport = require('./passport-config')
initPassport(
    passport, 
    email => users.find(user => user.email === email), // find in array
    id => { 
        console.log('Passport Config:', id);
        return users.find(user => user.id === id)
    }
) //initialize

// data
const users = []

// 1. view setup
// app.set('views', path.join(__dirname, 'views')); // for dynamic content path
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

// 2. auth session
app.use(flash()) 
app.use(session({
    secret: process.env.SESSION_SECRET, // "secret"
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


// 3. router
app.get('/', checkNeedAuthen, (req, res) => {
    console.log('index:', req.user);
    res.render('index.ejs', {name: req.user.name})
})
// 3.1 register route
app.get('/register', function(req, res) {
    res.render('register.ejs')
})
app.post('/register', async function(req, res) {
    console.log("Register:", req.body);    
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch (error) {
        res.redirect('/register')
    }

    console.log(users);
})

// 3.2 login route
app.get('/login', checkAlreadyAuthen, function(req, res, next) {
    res.render('login.ejs', { message: "" })
})
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

// 3.3 logout route
app.delete('/logout', (req, res) => {
    req.logout() // Passport exposed | terminate a login session
    res.redirect('/login')
})


// 4. Authentication check (optional)
function checkNeedAuthen(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.redirect('/login')
}

function checkAlreadyAuthen(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }

    next();
}

// Final: start server listener
app.listen(3000)