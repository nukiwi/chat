'use strict'

// module
const express = require('express')
const { User, Contact } = require('../sequelize')
const flash = require('express-flash')

// router setup
const router = express.Router()

// GET index
router.post('/', async (req, res) => {
    const owner = req.session.user
    const newContact = req.body.username

    try {
        const user = await User.findOne({ where: { username: newContact } })

        if (user) {
            const contact = await Contact.findOne({ where: { owner: owner, contact: newContact } })

            if (contact) {
                req.flash('error', 'Contact has already been added.')
            }
            else {
                var chatRoomId = await Contact.max('chatRoom')

                console.log('max: ', chatRoomId)

                if (chatRoomId == null)
                    chatRoomId = 0
                else {
                    var chatRoom = await Contact.findOne({ where: { owner: newContact, contact: owner } })

                    if (chatRoom == null)
                        chatRoomId++
                    else
                        chatRoomId = chatRoom.dataValues.chatRoom

                }

                await Contact.create({ owner: owner, contact: newContact, chatRoom: chatRoomId })
                req.flash('success', 'Contact has been added successfully.')
            }
        }
        else {
            req.flash('error', 'User does not exist.')
        }

        res.redirect('/')
    } catch (error) {
        console.log(error)
        req.flash('error', 'Failed to fetch user.')
    }
})

module.exports = router;