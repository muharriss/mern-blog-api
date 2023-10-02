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

// const firebase = require("firebase/app");
// const { getStorage, ref, uploadBytes, getMetadata, updateMetadata, getDownloadURL } = require("firebase/storage")

// const firebaseConfig = {
//     apiKey: "AIzaSyCd1vx2LXyTsIz3fXfzpEoyNfihGAzKm5o",
//     authDomain: "mern-myblog-api.firebaseapp.com",
//     projectId: "mern-myblog-api",
//     storageBucket: "mern-myblog-api.appspot.com",
//     messagingSenderId: "781210885516",
//     appId: "1:781210885516:web:37844124bbc9d6fd40caa9",
//     measurementId: "G-L4FFHLRL5Q"
// };

// firebase.initializeApp(firebaseConfig)

// const fileStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'images')
//     },
//     filename: (req, file, cb) => {
//         cb(null, new Date().getTime() + '-' + file.originalname)
//     }
// })

const fileStorage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
//     next();
// });

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT'], // Izinkan metode HTTP tertentu
    allowedHeaders: ['Content-Type', 'Authorization'], // Izinkan header tertentu
    optionsSuccessStatus: 200
}));

app.use(bodyParser.json()) // type JSON
app.use('/images', express.static(path.join(__dirname, 'images')))
// app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))

// app.post("/image", async (req, res) => {
//     const storage = getStorage();
//     const storageRef = ref(storage, req.file.originalname);

//     try {
//         // Upload file to Firebase Storage
//         await uploadBytes(storageRef, req.file.buffer);

//         // Get download URL for the uploaded image
//         const downloadURL = await getDownloadURL(storageRef);

//         // Get current metadata
//         // const metadata = await getMetadata(storageRef);

//         // Update metadata to set content type as image/jpeg
//         await updateMetadata(storageRef, {
//             contentType: req.file.mimetype
//         });

//         console.log("File uploaded successfully");
//         res.status(201).json({
//             message: "Upload image success",
//             data: downloadURL
//         });
//     } catch (error) {
//         console.error("Error uploading file:", error);
//         res.status(500).json({
//             message: "Error uploading image"
//         });
//     }
// });

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
