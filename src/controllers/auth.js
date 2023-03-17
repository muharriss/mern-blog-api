const Register = require('../models/auth')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const jwtSecret = process.env.JWT_SECRET;
const { validationResult } = require('express-validator')


exports.userRegister = (req, res) => {
    const hasil = validationResult(req)

    if (!hasil.isEmpty()) {
        const err = new Error('username atau password Tidak Sesuai');
        err.errorStatus = 400
        err.data = hasil.array()
        throw err
    }

    
    const username = req.body.username
    const password = req.body.password

    const posting = new Register({
        username: username,
        password: password
    })

    posting.save()
        .then(result => {
            res.status(201).json({
                message: 'Register berhasil',
                data: result
            })
        })
        .catch(err => {
            console.log('error', err)
        })

}

exports.userLogin = async (req, res) => {

    const { username, password } = req.body;
    const dataUser = await Register.findOne({ username: username, password: password });

    if (dataUser) {
        const payload = {
            userId: dataUser._id,
            name: dataUser.username
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.status(201).json({
            message: "login berhasil",
            data: {
                username: username,
                password: password
            },
            token: token
        });
    } else {
        res.status(404).json({
            message: "username atau password salah",
            data: {
                username: username,
                password: password
            }
        });
    }
}