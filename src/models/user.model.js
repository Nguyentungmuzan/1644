const mongoose = require('mongoose');

const UserInfo = mongoose.Schema({
    email: String,
    password: String,
    name: String,
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    role: String,
    versionkey: false
  });
  let User = mongoose.model('test', UserInfo)

  const ProductInfo = mongoose.Schema({ 
      name: String,
      type: String,
      price: Number,
      description: String,
      versionkey: false
  })
  let Product = mongoose.model('product', ProductInfo)

module.exports = {User, Product}



