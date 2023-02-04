// library imports
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const fs = require("fs");
const hbs = require("hbs");
// const mongo = require("mongodb").MongoClient;
const mongoose = require("mongoose");

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

  app.use("/login", (req, res) => {
    res.json({
      message: "Login page",
    });
  });

  //
  app.use("*", (req, res) => {
    res.json({
      message: "Another page",
    });
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