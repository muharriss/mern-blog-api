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
    comment: [
        {
            text: String,
            author: {
                type: Object
            },
            reply: [
                {
                    text: String,
                    author: {
                        type: Object
                    }
                }
            ]
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('BlogPost', BlogPost)