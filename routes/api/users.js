const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const keys = require("../../config/keys");
const gravatar = require("gravatar");

// Load user model
const User = require("../../models/User");

// Import validators
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// @route  GET api/users/test
// @desc   Test users route
// @access PUBLIC
router.get("/test", (req, res) => {
  res.status(200).json({
    message: "Users route is up!!!",
  });
});

// @route  POST api/users/register
// @desc   Register a new User
// @access PUBLIC
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.email = "This email is already in use.";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", // Size
        r: "pg", // Rating
        d: "mm", //Default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        dob: req.body.dob,
        screen_name: req.body.screen_name,
        avatar,
      });
      bcrypt.genSalt(10, (error, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err;
          }
          newUser.passport = hash;
          newUser
            .save()
            .then((user) => {
              res.json(user);
            })
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

// @route    POST api/users/login
// @desc     Login user / returning JWT
// @access   Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Find the user by email
  User.findOne({ email })
    .then((user) => {
      // Check for the user
      if (!user) {
        errors.email = "User not found for this email";
        return res.status(400).json(errors);
      }
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          // User Matched

          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          };
          // Sign the token
          jwt.sign(payload, keys.secret, { expiresIn: 3600 }, (err, token) => {
            res.json({ success: true, token: `Bearer ${token}` });
          });
        } else {
          errors.password = "Password incorrect";
          return res.status(400).json(errors);
        }
      });

      // Check password
    })
    .catch((err) => {});
});

// @route    POST api/users/current
// @desc     Return current user
// @access   Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json();
  }
);
module.exports = router;
