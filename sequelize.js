'use strict'

// module
const { Sequelize, DataTypes } = require('sequelize')

// connect to DB
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './chat.db'
})

// models
const User = sequelize.define(
    'User',
    {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
)

const Contact = sequelize.define(
    'Contact',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        owner: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contact: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        chatRoom:
        {
            type: DataTypes.INTEGER
        }
    }
)

const Message = sequelize.define(
    'Message',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        from: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        to: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        chatRoom:
        {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message:
        {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }
)

// test connection
async function dbConnect() {
    try {
        await sequelize.authenticate()
        console.log('Connection has been established successfully.')

        // synchronize
        await sequelize.sync({ force: false })
        console.log('Database synchronized successfully.')
    } catch (error) {
        console.error('Unable to connect to the database:', error)
    }
}

module.exports = { sequelize, dbConnect, User, Contact, Message }