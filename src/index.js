// library imports
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const fs = require("fs");
const hbs = require("express-handlebars");
// const mongo = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const model = require("./models/model");

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

  app.set("view engine", "hbs");
  app.set("views", "./src/views");
  app.use(express.urlencoded({ extended: true }));

  app.use(express.static("public"));

  app.engine(
    "hbs",
    hbs.engine({
      extname: "hbs",
      partialsDir: __dirname + "./src/layouts",
    })
  );

  app.get("/*", (req, res) => {
    res.render("index");
    const data = req.body;

    const user1 = new model({
      name: data.name,
      email: data.email,
      password: data.password,
      gender: data.gender,
      role: "Student",
    });

    try {
      user1.save();
    } catch (err) {
      console.log(err);
    }
  });

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
  // app.get("*", (req, res) => {
  //   res.writeHead(200, { "content-type": "text/html" });
  //   res.write(
  //     '<html><body><a href = "http://localhost:3333/student"> student </a></body></html>'
  //   );
  //   res.end();
  // });

  //Allow origin
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
  });

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
    console.log(
      `Server is listening on http://${process.env.NODE_HOST}:${process.env.NODE_PORT}`
    );
  });
};

// call the main function
main();
