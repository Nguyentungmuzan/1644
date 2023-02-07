// const mongo = require("mongodb");
// const url = "mongodb://localhost:27017/1644";
// mongo.connect(url, { useNewUrlParser: true }, (err, db) => {
// if (err) {
//  console.log(err);
//  process.exit(0);
//  }
// console.log("database connected!");
//  db.close();
// });
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
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
    note: String,
    role: String
  });

  const UserTest = mongoose.model('test', UserSchema)
  module.exports = { UserTest };