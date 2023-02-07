// library imports
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const fs = require("fs");
const hbs = require("hbs");
// const mongo = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const model = require('./models/model');
const { isMainThread } = require("worker_threads");

// mongoose.connect('mongodb+srv://1644:mysecretpassword@cluster0.dlafktq.mongodb.net/test');
// url to connect to the database (move to .env file)
// const url = "mongodb+srv://1644.8hjg4.mongodb.net/1644";
dotenv.config();

// main function
const main = async () => {
  const app = express();

  // app config
  app.use(cors());
  app.use(morgan("tiny"));
  app.use(express.json());
  

  app.get("/student", (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.write('<html><body><a href = "http://localhost:3333"> back to main </a></body></html>')
    res.end()
  });

  // const UserSchema = mongoose.Schema({
  //   email: String,
  //   password: String,
  //   name: String,
  //   gender: {
  //       type: String,
  //       enum: ['male', 'female', 'other']
  //   },
  //   createdAt: {
  //       type: Date,
  //       default: Date.now
  //   },
  //   note: String,
  //   role: String
  // });
  
  // const UserTest = mongoose.model('test', UserSchema)
  // module.exports = {UserTest}

  // const UserTest1 = new UserTest({
  //   email: "trantanminh0603@gmail.com",
  //   password: 111111,
  //   name: "minh",
  //   gender: "male"
  // })

  // try {
  //   UserTest1.save()
  // } catch (err) {
  //   console.log(err)
  // }

  //
  app.get("*", (req, res) => {
    res.writeHead(200, {'content-type': 'text/html'})
    res.write('<html><body><a href = "http://localhost:3333/student"> student </a></body></html>')
    res.end()
  });

  //Allow origin
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
  })

  // start the server
  app.listen(process.env.NODE_PORT, () => {
    try {
      // avoid the waring process
      mongoose.set("strictQuery", false);
      //connect to database
      mongoose.connect(process.env.MONGO_URL, () => {
        console.log("Connected to MongoDB");
      });
    } catch (error) {
      handleError(error);
    }
      // node host and node port are defined in the .env file
    console.log(`Server is listening on http://${process.env.NODE_HOST}:${process.env.NODE_PORT}`);
  });
};

// call the main function
main();