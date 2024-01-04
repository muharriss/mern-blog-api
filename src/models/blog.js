const mongoose = require('mongoose');
const auth = require('./auth');
const Schema = mongoose.Schema

const BlogPost = new Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    imageName: {
        type: String,
        required: true
    },
    author: {
        type: Object,
        required: true,
    },
    hidden: {
        type: Boolean,
        default: false
    },
    comment: [
        {
            text: String,
            author: {
                type: Object
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            reply: [
                {
                    text: String,
                    author: {
                        type: Object
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ]
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('BlogPost', BlogPost)