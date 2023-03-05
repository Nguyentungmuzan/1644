const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserInfo = new mongoose.Schema({
  name: String,
  email: String,
  phone: {
    type: String,
    length: 10 
  },
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

const User = mongoose.model('User', UserInfo);

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
  name: String,
  phone: String,
  address: String,
  user_id: String,
  versionkey: false,
  product_name: String,
});
let Order = mongoose.model("order", OrderInfo);

module.exports = { User, Product, Category, Cart, Payment, Order };
