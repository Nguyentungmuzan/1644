// library imports
const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
const hbs = require("express-handlebars");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");


const {User, Product, Category, Cart, Payment, Order} = require("./models/user.model");

// mongoose.connect('mongodb+srv://1644:mysecretpassword@cluster0.dlafktq.mongodb.net/test');
// url to connect to the database (move to .env file)
// const url = "mongodb+srv://1644.8hjg4.mongodb.net/1644";
dotenv.config();
const app = express();

// main function
async function main() {
  
  // app config
  app.use(cors());
  app.use(morgan("tiny"));
  app.use(express.json());

  // view engine config, public config
  app.set("view engine", "hbs");
  app.set("views", "./src/views");
  app.use(express.static(__dirname + "/public"));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));

  app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: false,
    partialsDir: __dirname + '/views/partials'
  }))
  
  
  // get routes
  app.get("/", (req,res) => {
    res.render("main");
  })

  app.get("/cart", (req,res) => {
    let data = Cart.find({})
    console.log(data)
    res.render('cart', {data: data});
  })

  app.get("/cart/payment", (req,res) => {
    res.render("navbar");
  })

  // post routes
  app.post("/", (req, res) => {
    const data = req.body;
    const product = new Cart({
      name: data.name,
      price: data.type,
      quantity: data.price
    });

    console.log(product)

    try {
      product.save();
    } catch (err) {
      console.log(err);
    }
    res.redirect('cart')
  });

  app.post("/cart/payment", (req,res) => {
    const data = req.body;
    const payment = new Payment({
      accountNumber: data.number,
      customerName: data.name,
      bank: data.bank,
    });

    console.log(payment)

    try {
      payment.save();
    } catch (err) {
      console.log(err);
    }
    res.redirect('/cart')
  })
  

  // start the server
  app.listen(process.env.NODE_PORT, () => {
    try {
      // avoid the waring process
      mongoose.set("strictQuery", false);
      //connect to database
      mongoose.connect(process.env.MONGO_URL, () => {
        console.log("Connected to Mongo®DB");
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
