// library imports
const express = require("express");
const dotenv = require("dotenv");
const hbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const multer = require("multer");
const alert = require("node-popup");
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

const { authRoute } = require("./route/authRoute");

dotenv.config();
const app = express();
const appApi = "/api";

// main function
async function main() {
  // app config
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

  app.use(appApi + "/user", authRoute);

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

  const oneDay = 1000 * 60 * 60 * 24;
  app.use(
    session({
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, maxAge: oneDay },
    })
  );

  // get routes
  app.get("/", async (req, res) => {
    let data = await User.find({}).lean();
    let session = req.session.user;
    res.render("home", { session: session });
  });

  async function checkSession(req, res, next) {
    // const user = req.user
    let session = req.session.user;
  }

  app.get("/shop", async (req, res) => {
    let session = req.session.user;
    if (!session) {
      res.redirect("/login");
    }
    const { cat } = req.query; //name cat ở header nhé
    let queryParam = {}; // đây là một object rỗng

    if (cat) {
      //nếu có cat nhận đc thì chạy ở dưới
      const category = await Category.findOne({ name: cat });
      if (category) {
        //nếu tìm đc category thì chạy ở dưới
        queryParam = { cid: category.id }; // nhận cid ở products đối chiếu với _id ở categories
      }
    }

    // let session = req.session.user
    let products = await Product.find({
      ...queryParam, //...lấy những thứ trong ngoặc ở trên và tìm products trùng với cid
    }).lean();
    res.render("shop/shop", { products: products, session: session });
  });

  // search
  app.get("/shop/search", async (req, res) => {
    let session = req.session.user;
    const data = req.query.searchbar;
    const products = await Product.find({
      name: { $regex: data, $options: "i" },
    }).lean();
    console.log(products);
    res.render("shop/shop", { products: products, session: session });
  });

  //sort

  app.post("/shop", async (req, res) => {
    let session = req.session.user;
    const data = req.body;
    const product = Product.find({}).lean();
    const cart = new Cart({
      name: data.name,
      price: data.price,
      quantity: 1,
      user_id: session.id,
      image: product[i].image,
    });
    cart.save();
    await res.redirect("/shop");
  });

  app.post("/detail/:id", upload.single("filename"), async (req, res) => {
    let session = req.session.user;
    if (!session) {
      res.redirect("/login");
    }
    const data = req.body;
    let id = req.params.id;
    const product = await Product.find({ _id: id }).lean();
    if (data.quantity > product[0].quantity) {
      return res.send(
        "<script>alert('Out of stock'); window.location.href='/shop';</script>"
      );
    } else {
      const cart = new Cart({
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        user_id: session.id,
        image: product[0].image,
      });

      const leftQuantity = product[0].quantity - data.quantity;

      await Product.findByIdAndUpdate({ _id: id }, { quantity: leftQuantity });
      cart.save();
      res.redirect("/shop");
    }
  });

  app.get("/main", async (req, res) => {
    let userInfo = await User.find({}).lean();
    res.render("home", { userInfo: userInfo });
  });

  //register user
  app.get("/api/user/register", async (req, res) => {
    res.render("user/register");
  });

  const bcrypt = require("bcrypt");

  //   const { name, email, phone, password } = req.body;

  //   if (!name || !email || !phone || !password) {
  //     return res.send("<script>alert('Please enter your full information'); window.location.href='/register';</script>");
  //   }

  //   if (phone.length > 10) {
  //     return res.send("<script>alert('Phone number must be 10 characters or less'); window.location.href='/register';</script>");
  //   }

  //   const saltRounds = 10; //The cost factor controls how much time is needed to calculate a single BCrypt hash
  //   const hashedPassword = await bcrypt.hash(password, saltRounds);
  //   const user = await User.findOne({ email });

  //   if (user) {
  //     return res.send("<script>alert('This email has already been registered. Please use a different email.'); window.location.href='/register';</script>");
  //   }

  //   const newuser = new User({
  //     name,
  //     email,
  //     phone,
  //     password: hashedPassword, // Save the hashed password to the database
  //     gender: req.body.gender,
  //     role: req.body.role,
  //   });

  //   newuser.save();
  //   res.redirect("/main");
  // });

  //login user
  app.get("/api/user/login", async (req, res) => {
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

  // app.post("/login", async (req, res, next) => {
  //   const { email, password } = req.body;

  //   // Check if email is in the correct format
  //   if (!/\S+@\S+\.\S+/.test(email)) {
  //     return res.send("<script>alert('Invalid email format, please re-type'); window.location.href='/login';</script>");
  //   }

  //   const user = await User.findOne({ email }).exec();
  //   req.user = user

  //   if (!user) {
  //     return res.send("<script>alert('Invalid email, please re-type'); window.location.href='/login';</script>");
  //   }

  //   const isPasswordValid = await bcrypt.compare(password, user.password);

  //   if (!isPasswordValid) {
  //     return res.send("<script>alert('Invalid password, please re-type'); window.location.href='/login';</script>");
  //   } else {
  //   next()
  //   }

  // }, loadSession, (req, res) => {
  //   if(req.user.role === 'admin') {
  //     res.redirect('readProduct')
  //   } else if(req.user.role === 'user') {
  //     res.redirect("/")
  //   } else {
  //     res.redirect('/login')
  //   }

  // });

  // async function loadSession(req, res, next) {
  //   const user = req.user
  //   req.session.user = {
  //     id: user._id,
  //     name: user.name,
  //     email: user.email,
  //     phone: user.phone,
  //     image: user.image
  //   }
  //   await req.session.save()
  //   next();
  // }

  app.get("/get-session", (req, res) => {
    res.send(req.session);
  });

  app.get("login", async (req, res) => {
    req.session.destroy();
    res.redirect("/main");
  });

  //Logout
  app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
  });

  //crud product

  app.get("/readProduct", async (req, res) => {
    let products = await Product.find({}).lean();
    res.render("crudProduct/read", { products: products });
  });

  app.get("/createProduct", async (req, res) => {
    let categories;

    try {
      categories = await Category.find().lean();
    } catch (error) {}

    res.render("crudProduct/create", { categories: categories });
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
      console.log();
      const product = new Product({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
        cid: req.body.category,
        image: imageURL,
      });
      product.save();
      res.redirect("/readProduct");
    }
  );

  app.get("/deleteProduct/:id", async (req, res) => {
    const id = req.params.id;
    await Product.deleteOne({ _id: id });
    res.redirect("/readProduct");
  });

  app.get("/updateProduct/:id", async (req, res) => {
    const id = req.params.id;
    const data = await Product.findById({ _id: id }).lean();
    let categories;

    try {
      categories = await Category.find().lean();
    } catch (error) {}
    console.log(data);

    res.render("crudProduct/update", { data: data, categories: categories });
  });

  app.post(
    "/updateProduct/:id",
    upload.single("filename"),
    async (req, res) => {
      const data = req.body;
      const id = req.params.id;

      await Product.findByIdAndUpdate(
        { _id: id },
        { ...data, image: imageURL, cid: req.body.category },
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

    await User.findByIdAndUpdate(
      { _id: id },
      { role: data.role },
      { new: true }
    ),
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

    res.render("crudUser/update", { data: data });
  });

  //

  app.get("/cart", async (req, res, next) => {
    let session = req.session.user;
    if (!session) {
      res.redirect("/login");
    }
    // console.log(session.id)
    let data = await Cart.find({ user_id: session.id }).lean(); // lean() is used to convert the Mongoose document into the plain JavaScript objects. It removes all the mongoose specific functions and properties from the document.
    let total_price = await Cart.aggregate([
      { $match: { user_id: session.id } },
      { $project: { name: 1, total: { $multiply: ["$price", "$quantity"] } } },
    ]);

    for (let i = 0; i < data.length; i++) {
      data[i].total_price = total_price[i].total;
    }
    let total = 0;

    for (let i = 0; i < total_price.length; i++) {
      total += total_price[i].total;
    }

    res.render("cart/cart", { data: data, total: total, session: session });
  });

  app.get("/cart/edit/:id", async (req, res) => {
    let session = req.session.id;
    const id = req.params.id;
    console.log(id);
    const data = await Cart.findById({ _id: id }).lean();
    console.log(data);
    res.render("cart/edit", { data: data, session: session });
  });

  app.get("/cart/delete/:id", async (req, res) => {
    const id = req.params.id;
    await Cart.deleteOne({ _id: id });
    res.redirect("/cart");
  });

  app.get("/cart/ship", async (req, res) => {
    let session = req.session.user;
    res.render("cart/ship", { session: session });
  });

  app.post("/cart/edit/:id", upload.single("filename"), async (req, res) => {
    const data = req.body;
    const id = req.params.id;

    if (data.quantity < 1) {
      return res.send(
        "<script>alert('Please enter valid quantity'); window.location.href='/cart';</script>"
      );
    } else {
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
    }
  });

  app.post("/cart", async (req, res) => {
    const id = req.query.id;
    const data = req.body;
    let session = req.session.user;
    // await Cart.updateOne({ _id: id }, { quantity: data.quantity }),
    //   (err, result) => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log(result);
    //     }
    //   };

    const order = new Order({
      name: data.name,
      address: data.address,
      phone: data.phone,
      product_name: data.product,
      user_id: session.id,
    });

    order.save();

    await Cart.deleteMany({ user_id: session.id });

    await res.redirect("/cart");
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
    // session_start()
    let session = await req.session.user;
    if (!session) {
      res.redirect("/login");
    }
    res.render("profile/profile", { session: session });
  });

  // app.post("/profile", upload.single("filename"), async (req, res, next) => {
  //   let id = await req.session.user.id
  //   console.log(id)
  //   const data = req.body;
  //   // let userInfo = await User.find({_id: session.id}).lean();
  //   const user = await User.findByIdAndUpdate({_id: id}, {...data, name: data.name, phone: data.phone, email: data.email}, {new: true})
  //   req.user = user
  //   // let profile = await User.findByIdAndUpdate({_id: id})
  //   // console.log(profile)
  //   next()
  // }, loadSession, (req, res) => {
  //   res.redirect("/profile")
  // })

  app.get("/detail/:id", async (req, res) => {
    let session = req.session.user;
    const id = req.params.id;
    const data = await Product.find({ _id: id }).lean();
    console.log(data);
    res.render("cart/detail", { data: data, session: session });
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
    // console.log(userInfo);

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
