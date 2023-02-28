// library imports
const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
const hbs = require("express-handlebars");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

const {
  User,
  Product,
  Category,
  Cart,
  Payment,
  Order,
} = require("./models/user.model");

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

  app.engine(
    "hbs",
    hbs.engine({
      extname: "hbs",
      defaultLayout: false,
      partialsDir: __dirname + "/views/partials",
    })
  );

  // get routes
  app.get("/admin", (req, res) => {
    res.render("cart/add");
  });

  app.get("/cart", async (req, res) => {
    let data = await Cart.find({}).lean(); // lean() is used to convert the Mongoose document into the plain JavaScript objects. It removes all the mongoose specific functions and properties from the document.
    let total_price = await Cart.aggregate([
      { $project: { name: 1, total: { $multiply: ["$price", "$quantity"] } } },
    ]);

    data = data.map((item, index) => {
      item.total_price = total_price[index].total;
      item.isRed = item.total_price > 1000;
      return item;
    });

    let data2 = await Cart.aggregate([
      {
        $lookup: { status: "true" },
        $project: { name: 1, total: { $multiply: ["price", "quantity"] } },
      },
    ]);

    console.log(data2);

    let total = 0;
    for (let i = 0; i < total_price.length; i++) {
      total += total_price[i].total;
    }

    res.render("cart/cart", { data: data, total: total, data2: data2 });
  });

  app.get("/cart/edit/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const data = await Cart.findById({ _id: id }).lean();
    console.log(data);
    res.render("cart/edit", { data: data });
  });

  app.get("/cart/delete/:id", async (req, res) => {
    const id = req.params.id;
    await Cart.deleteOne({ _id: id });
    res.redirect("/cart");
  });

  app.get("/", (req, res) => {
    res.render("home");
  });

  // post routes
  app.post("/admin", (req, res) => {
    const data = req.body;
    const product = new Cart({
      name: data.name,
      price: data.price,
      quantity: data.quantity,
      status: "false",
    });

    console.log(product);

    try {
      product.save();
    } catch (err) {
      console.log(err);
    }
    res.redirect("cart");
  });

  app.post("/cart/payment", (req, res) => {
    const data = req.body;
    const payment = new Payment({
      accountNumber: data.number,
      customerName: data.name,
      bank: data.bank,
    });

    console.log(payment);

    try {
      payment.save();
    } catch (err) {
      console.log(err);
    }
    res.redirect("/cart");
  });

  app.post("/cart/edit/:id", async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    await Cart.updateOne({ _id: id }, { quantity: data.quantity }),
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
        }
      };
    res.redirect("/cart");
  });

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
}

// call the main function
main();
