const express = require('express')
const app = express()
const productsController = require('../controllers/products')

// CREATE => POST
app.post('/product', productsController.createProduct)

// READ => GET
app.get('/products', productsController.getAllProducts )

module.exports = app