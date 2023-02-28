const User = require('../models/user');

const registerController = {
  showRegisterPage: (req, res) => {
    res.render('register');
  },

  registerUser: (req, res) => {
    const { name, email, password, gender, role } = req.body;

    const user = new User({
      name,
      email,
      password,
      gender,
      role
    });

    user.save()
      .then(() => {
        res.redirect('/login');
      })
      .catch((err) => {
        console.error(err);
        res.redirect('/register');
      });
  }
};

module.exports = registerController;
