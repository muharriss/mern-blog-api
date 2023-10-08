// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getStorage } from "firebase/storage";
const { initializeApp } = require("firebase/app")
const { getStorage } = require("firebase/storage")

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCd1vx2LXyTsIz3fXfzpEoyNfihGAzKm5o",
  authDomain: "mern-myblog-api.firebaseapp.com",
  projectId: "mern-myblog-api",
  storageBucket: "mern-myblog-api.appspot.com",
  messagingSenderId: "781210885516",
  appId: "1:781210885516:web:37844124bbc9d6fd40caa9",
  measurementId: "G-L4FFHLRL5Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

module.exports = {
  storage
}