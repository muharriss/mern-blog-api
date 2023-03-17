const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Register = new Schema({
    username: {
        type: String,
        // required: true
    },
    password: {
        type: String,
        // required: true
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('register', Register)