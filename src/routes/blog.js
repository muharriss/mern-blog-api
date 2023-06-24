const express = require('express')
const { body } = require('express-validator')
const app = express()
const blogController = require('../controllers/blog')

app.post('/post',
    [body('title').isLength({ min: 5 }).withMessage('input title tidak sesuai'),
    body('body').isLength({ min: 40 }).withMessage('input body tidak sesuai')],
    blogController.createBlogPost)

app.get('/posts', blogController.getAllBlogPost)
app.get('/post/:postId', blogController.getBlogPostById)
app.get('/posts/user', blogController.getBlogPostByUid)

app.put('/post/:postId',
    [body('title').isLength({ min: 5 }).withMessage('input title tidak sesuai'),
    body('body').isLength({ min: 40 }).withMessage('input body tidak sesuai')],
    blogController.updateBlogPost)

app.delete('/post/:postId', blogController.deleteBlogPost)

module.exports = app