const User = require('../models/user.model');

exports.showRegistrationForm = (req, res) => {
  res.render('register');
};

exports.register = async (req, res) => {
  const { name, email, password, gender, role } = req.body;
  try {
    const user = new User({ name, email, password, gender, role });
    await user.save();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Failed to register user.' });
  }
};
