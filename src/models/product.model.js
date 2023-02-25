const mongoose = require('mongoose')

const ProductInfo = mongoose.Schema({
    name: String,
    type: String,
    price: Number,
    description: String,
    type: String,
    versionkey: false
  })
module.exports = mongoose.model('product', ProductInfo)