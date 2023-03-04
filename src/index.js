// library imports
const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
const hbs = require("express-handlebars");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const multer = require("multer");
const alert = require("node-popup");
const bcrypt = require("bcrypt");
const session = require("express-session");

const {
  User,
  Product,
  Category,
  Cart,
  Payment,
  Order,
} = require("./models/user.model");
const async = require("hbs/lib/async");

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
  app.use(bodyparser.urlencoded({ extended: true }));

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

  let imageURL;
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //check file
      if (
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png"
      ) {
        cb(null, "public/img/");
      } else {
        cb(new Error("no image"), false);
      }
    },
    filename: function (req, file, cb) {
      (imageURL = file.originalname), cb(null, imageURL);
    },
  });

  var upload = multer({ storage: storage });

  // get routes
  app.get("/", async (req, res) => {
    let data = await User.find({}).lean();
    console.log(data);
    res.render("home");
  });

  app.get("/shop", async (req, res) => {
    const { cat } = req.query; //name cat ở header nhé
    let queryParam = {}; // đây là một object rỗng

    if (cat)  { //nếu có cat nhận đc thì chạy ở dưới
      const category = await Category.findOne({ name: cat });
      if (category) { //nếu tìm đc category thì chạy ở dưới
        queryParam = { cid: category.id }; // nhận cid ở products đối chiếu với _id ở categories
      }
    }

    let products = await Product.find({
      ...queryParam, //...lấy những thứ trong ngoặc ở trên và tìm products trùng với cid
    }).lean();
    res.render("shop/shop", { products: products });
  });
  
  app.get("/shop", async (req, res) => {
    let products = await Product.find({}).lean();
    res.render("shop/shop", { products: products });
  });


  // search
  app.get("/shop/search", async (req, res) => {
    const data = req.query.searchbar;
    const products = await Product.find({
      name: { $regex: data, $options: "i" },
    }).lean();
    console.log(products);
    res.render("shop/shop", { products: products });
  });

  //sort

  app.get("/main", async (req, res) => {
    let userInfo = await User.find({}).lean();
    console.log(userInfo);
    res.render("home", { userInfo: userInfo });
  });

  //register user
  app.get("/register", async (req, res) => {
    let users = await User.find({}).lean();
    res.render("user/register");
  });

  app.post("/register", async (req, res) => {
    const data = req.body;
    
    if (data.phone.length <= 10) {
      const product = new User({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        gender: data.gender,
        role: "user",
      });
    
      product.save();
      res.redirect("/main");
    } else {
      // Display a warning message to the user
      res.send("<script>alert('Phone number must be 10 characters or less'); window.location.href='/register';</script>");

    }
  });
  

  
  //login user
  app.get("/login", async (req, res) => {
    let users = await User.find({}).lean();
    res.render("user/login");
  });

  // app.set('trust proxy', 1) // trust first proxy
  app.use(
    session({
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
    })
  );
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(401).send("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid email or password");
    }

    // Store user data in session
    req.session.user = {
      id: user._id,
      user: user.name,
      email: user.email,
    };

    res.redirect("/main");
  });

  app.get("/get-session", (req, res) => {
    res.send(req.session);
  });

  //crud product

  app.get("/readProduct", async (req, res) => {
    let products = await Product.find({}).lean();
    res.render("crudProduct/read", { products: products });
  });

  app.post(
    "/createProduct",
    upload.single("filename"),
    async (req, res, next) => {
      const file = req.file;
      if (!file) {
        const err = new Error(`No file is choosen`);
        return next(err);
      }
      const product = new Product({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
        image: imageURL,
      });
      product.save();
      res.redirect("/readProduct");
    }
  );
  app.get("/createProduct", async (req, res) => {
    let categories;

    try {
      categories = await Category.find().lean();
    } catch (error) {}

    res.render("crudProduct/create", { categories: categories });
  });

  app.get("/deleteProduct/:id", async (req, res) => {
    const id = req.params.id;
    await Product.deleteOne({ _id: id });
    res.redirect("/readProduct");
  });

  app.post(
    "/updateProduct/:id",
    upload.single("filename"),
    async (req, res) => {
      const data = req.body;
      const id = req.params.id;

      await Product.findByIdAndUpdate(
        { _id: id },
        { ...data, image: imageURL },
        { new: true }
      ),
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
          }
        };

      res.redirect("/readProduct");
    }
  );

  app.get("/updateProduct/:id", async (req, res) => {
    const id = req.params.id;
    const data = await Product.findById({ _id: id }).lean();
    console.log(data);

    res.render("crudProduct/update", { data: data });
  });

  //crud category

  app.get("/readCategory", async (req, res) => {
    let categories = await Category.find({}).lean();
    res.render("crudCategory/read", { categories: categories });
  });

  app.post("/createCategory", async (req, res) => {
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });
    category.save();
    res.redirect("/readCategory");
  });
  app.get("/createCategory", (req, res) => {
    res.render("crudCategory/create");
  });

  app.get("/deleteCategory/:id", async (req, res) => {
    const id = req.params.id;
    await Category.deleteOne({ _id: id });
    res.redirect("/readCategory");
  });

  app.post("/updateCategory/:id", async (req, res) => {
    const data = req.body;
    const id = req.params.id;

    await Category.findByIdAndUpdate({ _id: id }, { ...data }, { new: true }),
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
        }
      };

    res.redirect("/readCategory");
  });

  app.get("/updateCategory/:id", async (req, res) => {
    const id = req.params.id;
    const data = await Category.findById({ _id: id }).lean();
    console.log(data);

    res.render("crudCategory/update", { data: data });
  });

  //crud user

  app.get("/readUser", async (req, res) => {
    let users = await User.find({}).lean();
    res.render("crudUser/read", { users: users });
  });

  app.get("/deleteUser/:id", async (req, res) => {
    const id = req.params.id;
    await User.deleteOne({ _id: id });
    res.redirect("/readUser");
  });

  app.post("/updateUser/:id", async (req, res) => {
    const data = req.body;
    const id = req.params.id;

    await User.findByIdAndUpdate({ _id: id }, { ...data }, { new: true }),
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
        }
      };

    res.redirect("/readUser");
  });

  app.get("/updateUser/:id", async (req, res) => {
    const id = req.params.id;
    const data = await User.findById({ _id: id }).lean();
    console.log(data);

    res.render("crudUser/update", { data: data });
  });

  //

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
    let total = 0;

    for (let i = 0; i < total_price.length; i++) {
      total += total_price[i].total;
    }

    res.render("cart/cart", { data: data, total: total });
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

  app.get("/cart/ship", async (req, res) => {
    res.render("cart/ship");
  });

  app.post("/cart/edit/:id", upload.single("filename"), async (req, res) => {
    const data = req.body;
    const id = req.params.id;

    await Cart.updateOne(
      { _id: id },
      { quantity: data.quantity, image: data.image },
      { new: true }
    ),
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
        }
      };

    res.redirect("/cart");
  });

  app.post("/cart", async (req, res) => {
    const id = req.query.id;
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

  app.get("/profile", async (req, res) => {
    res.render("profile/profile");
  });

  app.get("/detail", async (req, res) => {
    const id = req.params.id;
    res.render("cart/detail");
  });
  // post routes
  app.post("/", async (req, res) => {
    const data = req.body;
    const product = new User({
      name: data.name,
      password: data.password,
      email: data.email,
      gender: data.gender,
      image: data.image,
      status: "false",
    });

    console.log(product);

    let userInfo = await User.find({}).lean();
    console.log(userInfo);

    try {
      product.save();
    } catch (err) {
      console.log(err);
    }
    res.redirect("main");
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
