const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserInfo = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
  },
  image: String,
  phone: {
    type: String,
    length: 11,
  },
});

// Hash password before saving to the database
// UserInfo.pre('save', async function (next) {
//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(this.password, salt);
//     this.password = hashedPassword;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Compare password with hashed password in the database
// UserInfo.methods.comparePassword = async function (password) {
//   try {
//     const isMatch = await bcrypt.compare(password, this.password);
//     return isMatch;
//   } catch (error) {
//     return false;
//   }
// };
UserInfo.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserInfo);
// module.exports = User;

// const UserInfo = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   gender: {
//     type: String,
//     enum: ["male", "female", "other"],
//   },
//   role: {
//     type: String,
//     enum: ["user"],
//   },

//   // createdAt: {
//   //   type: Date,
//   //   default: Date.now,
//   // },
//   // role: String,
//   // versionkey: false,
//   image: String,
// });

// // Hash password before saving to the database
// UserInfo.pre('save', async function (next) {
//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(this.password, salt);
//     this.password = hashedPassword;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Compare password with hashed password in the database
// UserInfo.methods.comparePassword = async function (password) {
//   try {
//     const isMatch = await bcrypt.compare(password, this.password);
//     return isMatch;
//   } catch (error) {
//     return false;
//   }
// };

// let User = mongoose.model("User", UserInfo);
// module.exports = User;

const ProductInfo = mongoose.Schema({
  name: String,
  type: String,
  price: Number,
  description: String,
  image: String,
  quantity: Number,
  cid: String,
  versionkey: false,
});
let Product = mongoose.model("product", ProductInfo);

const CategoryInfo = mongoose.Schema({
  name: String,
  description: String,
  versionkey: false,
});
let Category = mongoose.model("category", CategoryInfo);

const CartInfo = mongoose.Schema({
  name: String,
  quantity: Number,
  image: String,
  price: Number,
  status: Boolean,
  user_id: String,
  versionkey: false,
});
let Cart = mongoose.model("carts", CartInfo);

const PaymentInfo = mongoose.Schema({
  customerName: String,
  accountNumber: String,
  bank: String,
  versionkey: false,
});

let Payment = mongoose.model("payment", PaymentInfo);

const OrderInfo = mongoose.Schema({
  customerName: String,
  idPayment: Number,
  versionkey: false,
});
let Order = mongoose.model("order", OrderInfo);

module.exports = { User, Product, Category, Cart, Payment, Order };
