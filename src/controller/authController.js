const loadSession = require("../middleware/index.js");
const { User } = require("../models/user.model.js");
const { prepareResponse } = require("../service/response.js");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { sendConfirmEmail } = require("../service/mailHandle.js");
const { confirmEmail } = require("../service/mailTemplate.js");
const { localJWT } = require("node-localstorage");

const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return prepareResponse(res, 400, error.array());
    }

    // Check if email is in the correct format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return prepareResponse(res, 200, "Please enter valid email");
    }

    const user = await User.findOne({ email }).exec();
    req.user = user;

    if (!user) {
      return prepareResponse(res, 400, "Email or password are incorrect");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return prepareResponse(res, 400, "Email or password are incorrect");
    } else {
      const accessToken = jwt.sign(
        { _id: user.id, name: user.name },
        process.env.JWT_KEY,
        {
          expiresIn: process.env.REFRESH_TOKEN_EXP,
        }
      );
      if (req.user.role == "user") {
        return prepareResponse(res, 200, "move to user page", {
          accessToken: accessToken,
        });
      } else if (req.user.role == "admin") {
        return prepareResponse(res, 200, "move to admin page", {
          accessToken: accessToken,
        });
      } else {
        return prepareResponse(res, 200, "redirect to login page");
      }
    }
  } catch (error) {
    return prepareResponse(res, 400, error);
  }
};

const registerController = async (req, res, next) => {
  const data = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return prepareResponse(res, 400, error.array());
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const email = req.body.email;
    const user = await User.findOne({ email }).lean();
    if (user) {
      return prepareResponse(res, 400, "Account already exists");
    } else {
      if (!data.name || !data.email || !data.phone || !data.password) {
        return prepareResponse(res, 400, "All information is require");
      } else if (data.phone.length > 10) {
        return prepareResponse(res, 400, "Please enter invalid phone number");
      }

      if (data.password.length < 8) {
        return prepareResponse(
          res,
          400,
          "Password must contain at least 8 character"
        );
      } else if (!data.password.match(/[A-Z]/)) {
        return prepareResponse(
          res,
          400,
          "Password must contain at least one uppercase"
        );
      } else if (!data.password.match(/[!-@]/)) {
        return prepareResponse(
          res,
          400,
          "Password must contain at least one special character"
        );
      }
    }

    const newUser = new User({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      gender: data.gender,
      role: data.role,
    });
    newUser.save();
    return prepareResponse(res, 201, "Create user success");
  } catch (err) {
    console.log(err);
    return prepareResponse(res, 502, err);
  }
};

module.exports = { registerController, loginController };
