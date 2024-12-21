'use strict'

// module
const express = require('express')
const { Contact } = require('../sequelize')

// router setup
const router = express.Router()

function isNotLoggedIn(req, res, next) {
    if (!req.session.user && req.originalUrl !== '/login')
        res.redirect('/login')
    else
        next()
}

// GET index
router.get('/', isNotLoggedIn, async (req, res) => {
    const success = req.flash('success')
    const error = req.flash('error')
    const user = req.session.user

    const contacts = await Contact.findAll({ where: { owner: user } })

    res.render('index', { user: req.session.user, success, error, contacts })
})

module.exports = router;