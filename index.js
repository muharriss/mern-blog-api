const express = require('express')
const app = express()
const port = process.env.PORT || 4000
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')
const cors = require('cors')

const authRoutes = require('./src/routes/auth')
const blogRoutes = require('./src/routes/blog')

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader("Access-Control-Allow-Credentials", "true")
    next();
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT'], // Izinkan metode HTTP tertentu
    allowedHeaders: ['Content-Type', 'Authorization'] // Izinkan header tertentu
  }));

app.use(bodyParser.json()) // type JSON
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))


app.use('/v1/auth', authRoutes)

const jwt = require('jsonwebtoken')
require('dotenv').config()
app.use((req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log(token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded
        console.log('decoded', decoded)
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Auth failed' });
    }
}
)

app.use('/v1/blog', blogRoutes)


app.use((error, req, res, next) => {
    const status = error.errorStatus || 500
    const message = error.message
    const data = error.data
    res.status(status).json({
        message: message,
        data: data
    })
})


const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_CONNECTION);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }


  connectDB()
    .then(() => {
        app.listen(port, () => console.log('connection success'))

    })
    .catch(err => console.log("err disini:", err))
