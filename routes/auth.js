'use strict'

// modules
const express = require('express')
const { User } = require('../sequelize')
const flash = require('express-flash')
const bcrypt = require('bcrypt')
const multer = require('multer')
const fs = require('fs')

// where profile pics are uploaded
const path = './pfp/'
const upload = multer({ dest: path })

//bcrypt
const saltRounds = 10

// router setup
const router = express.Router()
router.use(flash())

// function that handles redirects with flash messages
function redirectFlash(req, res, route, title, message) {
    req.flash(title, message)
    res.redirect(route)
}

function isLoggedIn(req, res, next) {
    if (req.session.user)
        res.redirect('/')
    else
        next()
}

// GET login
router.get('/login', isLoggedIn, (req, res) => {
    const error = req.flash('error')
    res.render('login', { error })
})

// POST login
router.post('/login', async (req, res) => {
    const userToLog = req.body

    const user = await User.findOne({ where: { username: userToLog.username } })

    if (user) {
        try {
            const passwordCheck = await bcrypt.compare(userToLog.password, user.dataValues.password)

            if (passwordCheck) {
                req.session.user = userToLog.username
                res.redirect('/')
            }
            else {
                redirectFlash(req, res, '/login', 'error', 'Password is incorrect.')
            }
        } catch (error) {
            redirectFlash(req, res, '/login', 'error', 'Failed to check if password matches username.')
        }
    }
    else {
        redirectFlash(req, res, '/login', 'error', 'Username does not exist.')
    }
})

// GET signup
router.get('/signup', isLoggedIn, (req, res) => {
    const error = req.flash('error')
    res.render('signup', { error })
})

// POST signup
router.post('/signup', upload.single('image'), async (req, res) => {
    const newUser = req.body
    const file = req.file
    // username has to be at least of three characters
    if (newUser.username.length < 3)
        redirectFlash(req, res, '/signup', 'error', 'Username needs to be at least three characters long.')
    else if (!newUser.username.match(/[a-z]+/))
        redirectFlash(req, res, '/signup', 'error', 'Username can only contain lowercase letters.')
    else {
        // search if username is taken
        const user = await User.findOne({ where: { username: newUser.username } })

        if (user) {
            redirectFlash(req, res, '/signup', 'error', 'Username is already taken.')
        }
        else {
            try {
                bcrypt.hash(newUser.password, saltRounds, async function (err, hash) {
                    await User.create({ username: newUser.username, password: hash })
                })
            } catch (error) {
                redirectFlash(req, res, '/signup', 'error', 'Failed to register user in database.')
            }

            if (file) {
                fs.rename(file.path, path + newUser.username, () => {
                    console.log('File has been renamed.')
                })
            }
            res.redirect('/login')
        }
    }
})
module.exports = router;