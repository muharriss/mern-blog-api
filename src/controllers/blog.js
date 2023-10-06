const { validationResult } = require('express-validator')
const path = require('path')
const fs = require('fs')
const BlogPost = require('../models/blog');
const { count } = require('console');
const Register = require('../models/auth');
const blog = require('../models/blog');
const moment = require('moment');

const firebase = require("firebase/app");
const { getStorage, ref, uploadBytes, getMetadata, updateMetadata, getDownloadURL } = require("firebase/storage")

exports.createBlogPost = async (req, res, next) => {

    try {
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
    
    
    //firebase
        const firebaseConfig = {
            apiKey: "AIzaSyCd1vx2LXyTsIz3fXfzpEoyNfihGAzKm5o",
            authDomain: "mern-myblog-api.firebaseapp.com",
            projectId: "mern-myblog-api",
            storageBucket: "mern-myblog-api.appspot.com",
            messagingSenderId: "781210885516",
            appId: "1:781210885516:web:37844124bbc9d6fd40caa9",
            measurementId: "G-L4FFHLRL5Q"
        };
    
        firebase.initializeApp(firebaseConfig)
    
        const storage = getStorage();
        const storageRef = ref(storage, req.file.originalname);
    
    
        // Upload file to Firebase Storage
        await uploadBytes(storageRef, req.file.buffer);
    
        // Get download URL for the uploaded image
        const downloadURL = await getDownloadURL(storageRef);
    
        // Get current metadata
        // const metadata = await getMetadata(storageRef);
    
        // Update metadata to set content type as image/jpeg
        await updateMetadata(storageRef, {
            contentType: req.file.mimetype
        });
    //firebase
    
        const { title, body } = req.body
        const image = downloadURL
    
    
        const author = {
            uid: req.user.userId,
            name: req.user.name
        }
        console.log('author', author)
        console.log("image", req.file)
    
        const posting = new BlogPost({
            title: title,
            body: body,
            image: image,
            author: author
        })

       await posting.save()

       res.status(201).json({
        message: "Create BLog Post Success",
        data: posting
    })

    }catch (err){
        next(err)
    }  


    // posting.save()
    //     .then(result => {

    //         res.status(201).json({
    //             message: "Create BLog Post Success",
    //             data: result
    //         })

    //     })
    //     .catch(err => {
    //         console.log('err:', err)
    //     })

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
                const createdAt = moment(post.createdAt);
                const updatedAt = moment(post.updatedAt);
                return {
                    _id: post._id,
                    title: post.title,
                    body: post.body,
                    image: post.image,
                    author: post.author,
                    comment: post.comment,
                    createdAt: createdAt.fromNow(),
                    updatedAt: updatedAt.fromNow(),
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

exports.getBlogPostByUid = (req, res, next) => {
    const currentPage = req.query.page || 1
    const perPage = req.query.perPage || 5
    const sortBy = req.query.sort_by || 'createdAt';
    const sortOrder = req.query.sort_order || 'desc';
    let totalItem

    BlogPost.find({
        author: {
            uid: req.user.userId,
            name: req.user.name
        }
    })
        .countDocuments()
        .then(count => {
            totalItem = count
            return BlogPost.find({
                author: {
                    uid: req.user.userId,
                    name: req.user.name
                }
            })
                .sort({ [sortBy]: sortOrder })
                .skip((parseInt(currentPage) - 1) * parseInt(perPage))
                .limit(parseInt(perPage))
        })
        .then(result => {

            const formattedPosts = result.map(post => {
                const createdAt = moment(post.createdAt);
                const updatedAt = moment(post.updatedAt);
                return {
                    _id: post._id,
                    title: post.title,
                    body: post.body,
                    image: post.image,
                    author: post.author,
                    comment: post.comment,
                    createdAt: createdAt.fromNow(),
                    updatedAt: updatedAt.fromNow(),
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

exports.updateComment = (req, res, next) => {
    const hasil = validationResult(req)

    if (!hasil.isEmpty()) {
        const err = new Error('Input Text Tidak Sesuai');
        err.errorStatus = 400
        err.data = hasil.array()
        throw err
    }

    const postId = req.params.postId
    const author = req.user.name
    const { text } = req.body

    const newComment = {
        text: text,
        author: author
    }

    BlogPost.findById(postId)
        .then(post => {
            if (!post) {
                const err = new Error("Blog Post Tidak Ditemukan")
                err.errorStatus = 404
                throw err
            }

            post.comment.push(newComment);
            return post.save()
        })
        .then(result => {
            res.status(200).json({
                message: 'update comment Sukses',
                data: result
            })
        })
        .catch(err => {
            next(err)
        })
}

exports.updateReplyComment = async (req, res, next) => {
    try {
        const hasil = validationResult(req)

        if (!hasil.isEmpty()) {
            const err = new Error('Input Text Tidak Sesuai');
            err.errorStatus = 400
            err.data = hasil.array()
            throw err
        }

        const postId = req.params.postId
        const author = req.user.name
        const { text } = req.body
        const commentId = req.params.commentId

        const blogPost = await BlogPost.findById(postId)
        if (!blogPost) {
            const err = new Error("Blog Post Tidak Ditemukan")
            err.errorStatus = 404
            throw err
        }

        const comment = blogPost.comment.find((c) => c._id == commentId)
        if (!comment) {
            const err = new Error("Comment Tidak Ditemukan")
            err.errorStatus = 404
            throw err
        }

        const reply = {
            text: text,
            author: author,
        }

        comment.reply.push(reply)

        await blogPost.save()

        res.status(200).json({
            message: 'reply comment Sukses',
            data: blogPost
        })

    } catch (err) {
        next(err)
    }
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

exports.delateComment = async (req, res, next) => {
    try {
        const postId = req.params.postId
        const commentId = req.params.commentId

        const blogPost = await BlogPost.findById(postId)
        if (!blogPost) {
            const err = new Error("Blog Post Tidak Ditemukan")
            err.errorStatus = 404
            throw err
        }

        const comment = blogPost.comment.find((c) => c._id == commentId)
        if (!comment) {
            const err = new Error("Komentar Tidak Ditemukan")
            err.errorStatus = 404
            throw err
        }

        blogPost.comment = blogPost.comment.filter((c) => c._id != commentId);

        await blogPost.save()

        res.status(200).json({
            massage: 'Komentar Berhasil Dihapus',
            data: blogPost
        })

    } catch (err) {
        next(err)
    }
}

exports.delateReplyComment = async (req, res, next) => {
    try {
        const postId = req.params.postId
        const commentId = req.params.commentId
        const replyId = req.params.replyId

        const blogPost = await BlogPost.findById(postId)
        if (!blogPost) {
            const err = new Error("Blog Post Tidak Ditemukan")
            err.errorStatus = 404
            throw err
        }

        const comment = blogPost.comment.find((c) => c._id == commentId)
        if (!comment) {
            const err = new Error("Komentar Tidak Ditemukan")
            err.errorStatus = 404
            throw err
        }

        const reply = comment.reply.find((c) => c._id == replyId)
        if (!reply) {
            const err = new Error("Balasan Tidak Ditemukan")
            err.errorStatus = 404
            throw err
        }

        comment.reply = comment.reply.filter((c) => c._id != replyId)

        await blogPost.save()

        res.status(200).json({
            message: 'Balasan Berhasil Dihapus',
            data: blogPost
        })

    } catch (err) {
        next(err)
    }
}

const removeImage = (filePath) => {
    console.log('filePath', filePath)
    console.log('dir name:', __dirname)

    filePath = path.join(__dirname, '../..', filePath)
    fs.unlink(filePath, err => console.log(err))
}