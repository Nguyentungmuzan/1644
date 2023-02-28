const mongoose = require("mongoose");

const UserInfo = mongoose.Schema({
  email: String,
  password: String,
  name: String,
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  // createdAt: {
  //   type: Date,
  //   default: Date.now,
  // },
  // role: String,
  // versionkey: false,
});
let User = mongoose.model("test", UserInfo);

const ProductInfo = mongoose.Schema({
  name: String,
  type: String,
  price: Number,
  description: String,
  image: String,
  quantity: Number,
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
  price: Number,
  status: Boolean,
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
