const { validationResult } = require('express-validator')
const path = require('path')
const fs = require('fs')
const BlogPost = require('../models/blog');
const { count } = require('console');
const Register = require('../models/auth')



exports.createBlogPost = (req, res, next) => {

    const hasil = validationResult(req)

    if (!hasil.isEmpty()) {
        const err = new Error('Input Title atau Body Tidak Sesuai');
        err.errorStatus = 400
        err.data = hasil.array()
        throw err
    }

    if (!req.file) {
        const err = new Error('Image Harus Di Upload');
        err.errorStatus = 422
        throw err
    }

    const { title, body } = req.body
    const image = req.file.path


    const author = {
        uid: req.user.userId,
        name: req.user.name
    }
    console.log('author', author)

    const posting = new BlogPost({
        title: title,
        body: body,
        image: image,
        author: author
    })

    posting.save()
        .then(result => {

            res.status(201).json({
                message: "Create BLog Post Success",
                data: result
            })

        })
        .catch(err => {
            console.log('err:', err)
        })

}

exports.getAllBlogPost = (req, res, next) => {
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 5
    const sortBy = req.query.sort_by || 'createdAt';
    const sortOrder = req.query.sort_order || 'desc';
    let totalItem

    BlogPost.find()
        .countDocuments()
        .then(count => {
            totalItem = count
            return BlogPost.find()
                .sort({ [sortBy]: sortOrder })
                .skip((parseInt(currentPage) - 1) * parseInt(perPage))
                .limit(parseInt(perPage))
        })
        .then(result => {

            const formattedPosts = result.map(post => {
                return {
                    _id: post._id,
                    title: post.title,
                    body: post.body,
                    image: post.image,
                    author: post.author,
                    createdAt: post.createdAt.toDateString(),
                    updatedAt: post.updatedAt.toDateString(),
                }
            });

            res.status(200).json({
                message: 'Data Blog post Berhasil dipanggil',
                data: formattedPosts,
                total_data: totalItem,
                per_page: parseInt(perPage),
                current_page: parseInt(currentPage)
            })
        })
        .catch(err => {
            next(err)
        })
}

exports.getBlogPostById = (req, res, next) => {
    const postId = req.params.postId
    BlogPost.findById(postId)
        .then(result => {
            if (!result) {
                const error = new Error('Blog Post Tidak Ditemukan')
                error.errorStatus = 404
                throw error
            }
            res.status(200).json({
                massage: 'Data Blog Post Berhasil Dipanggil',
                data: result
            })
        })
        .catch(err => {
            next(err)
        })
}

exports.updateBlogPost = (req, res, next) => {
    const hasil = validationResult(req)

    if (!hasil.isEmpty()) {
        const err = new Error('invalid value');
        err.errorStatus = 400
        err.data = hasil.array()
        throw err
    }

    if (!req.file) {
        const err = new Error('Image Harus Di Upload');
        err.errorStatus = 422
        throw err
    }

    const { title, body } = req.body
    const image = req.file.path
    const postId = req.params.postId

    BlogPost.findById(postId)
        .then(post => {
            if (!post) {
                const err = new Error("Blog Post Tidak Ditemukan")
                err.errorStatus = 404
                throw err
            }
            if (post.author.uid !== req.user.userId) {
                const err = new Error("ini bukan postingan anda")
                err.errorStatus = 403
                throw err
            }

            removeImage(post.image)

            post.title = title
            post.body = body
            post.image = image

            return post.save()
        })
        .then(result => {
            res.status(200).json({
                message: 'update Sukses',
                data: result
            })
        })
        .catch(err => {
            next(err)
        })
}

exports.deleteBlogPost = (req, res, next) => {
    const postId = req.params.postId



    BlogPost.findById(postId)
        .then(post => {
            if (!post) {
                const err = new Error("Blog Post Tidak Ditemukan")
                err.errorStatus = 404
                throw err
            }
            if (post.author.uid !== req.user.userId) {
                const err = new Error("ini bukan postingan anda")
                err.errorStatus = 403
                throw err
            }

            removeImage(post.image)
            return BlogPost.findByIdAndRemove(postId)

        })
        .then(result => {
            res.status(200).json({
                massage: 'Hapus Blog Post Berhasil',
                data: result
            })

        })
        .catch(err => {
            next(err)
        })
}

const removeImage = (filePath) => {
    console.log('filePath', filePath)
    console.log('dir name:', __dirname)

    filePath = path.join(__dirname, '../..', filePath)
    fs.unlink(filePath, err => console.log(err))
}