const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongo = require("mongodb").MongoClient;
const url = "mongodb+srv://1644.8hjg4.mongodb.net/1644";
dotenv.config();

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

  app.listen(process.env.NODE_PORT, () => {
    mongo.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) {
       console.log(err);
       process.exit(0);
       }
      console.log("Database connected!");
       db.close();
      });      
    console.log(`Server is listening on http://${process.env.NODE_HOST}:${process.env.NODE_PORT}`);
  });
};

main();