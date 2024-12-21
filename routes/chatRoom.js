'use strict'

// module
const express = require('express')
const { Message } = require('../sequelize')

// router setup
const router = express.Router()

// GET index
router.get('/:id', async (req, res) => {
    const chatRoomId = req.params.id

    const messages = await Message.findAll({ where: { chatRoom: chatRoomId } })

    res.json(messages)
})

module.exports = router;