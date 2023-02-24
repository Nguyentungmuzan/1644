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
    role: String
  });
module.exports = mongoose.model('test', UserInfo)



