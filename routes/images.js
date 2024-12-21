'use strict'

// modules
const express = require('express')
const fs = require('fs')

const path = './pfp/'

// router setup
const router = express.Router()

// GET index
router.get('/:user', (req, res) => {
    const imageName = req.params.user
    let readStream = undefined

    if (fs.existsSync(path + imageName)) {
        readStream = fs.createReadStream(path + imageName)
    } else {
        readStream = fs.createReadStream(path + 'defaultPfp.png')
    }

    readStream.pipe(res)
})

module.exports = router;