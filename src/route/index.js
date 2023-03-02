// const express = require('express');
// const router = express.Router();
// const User = require('../models/user.model');

// router.get('/register', (req, res) => {
//   res.render('register');
// });

// router.post('/register', async (req, res) => {
//   const { name, email, password, gender, role } = req.body;
//   try {
//     const user = await User.create({ name, email, password, gender, role });
//     res.redirect('/login');
//   } catch (err) {
//     console.error(err);
//     res.render('register', { error: 'Error registering user. Please try again.' });
//   }
// });

// module.exports = router;





// // const User = require('../models/user');

// // const registerController = {
// //   showRegisterPage: (req, res) => {
// //     res.render('register');
// //   },

// //   registerUser: (req, res) => {
// //     const { name, email, password, gender, role } = req.body;

// //     const user = new User({
// //       name,
// //       email,
// //       password,
// //       gender,
// //       role
// //     });

// //     user.save()
// //       .then(() => {
// //         res.redirect('/login');
// //       })
// //       .catch((err) => {
// //         console.error(err);
// //         res.redirect('/register');
// //       });
// //   }
// // };

// // module.exports = registerController;
