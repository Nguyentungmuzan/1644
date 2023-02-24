const mongoose = require('mongoose')

const ProductInfo = mongoose.Schema({
    name: String,
    type: String,
    price: Number,
    description: String,
    type: String
  })
module.exports = mongoose.model('test', ProductInfo)