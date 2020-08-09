const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const keys = require("../../config/keys");
const gravatar = require("gravatar");
const mongoose = require("mongoose");
// Load user model
const User = require("../../models/User");

// Import validators
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const { unsubscribe } = require("./statuses");

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
          newUser.password = hash;
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
// @route  GET api/users/id
// @desc   get a user profile
// @access Punlic
router.get("/id/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ usernotfound: "This user does not exist" });
      }
      res.json(user);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});
// @route  GET api/users/screen_name
// @desc   get a user profile
// @access Public
router.get("/handle/:screen_name", (req, res) => {
  User.findOne({ screen_name: req.params.screen_name })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ usernotfound: "This user does not exist" });
      }
      res.json(user);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

// @route  GET api/users/me
// @desc   get current user profile
// @access Private
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user.id)
      .then((user) => {
        if (!user) {
          return res
            .status(404)
            .json({ usernotfound: "This user does not exist" });
        }
        res.json(user);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  }
);

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
      // Check for user
      if (!user) {
        errors.email = "User not found";
        return res.status(404).json(errors);
      }

      // Check password
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          // User matched

          // Create JWT payload
          const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            screen_name: user.screen_name,
          };

          // Sign the token
          jwt.sign(payload, keys.secret, { expiresIn: 3600 }, (err, token) => {
            res.json({
              success: true,
              token: `Bearer ${token}`,
            });
          });
        } else {
          errors.password = "Password incorrect";
          return res.status(400).json(errors);
        }
      });
    })
    .catch((err) => {});
});

// @route    POST api/users/friendships/create
// @desc     Follow user
// @access   Private
router.post(
  "/friendships/create",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      User.findById(req.user.id).then((user) => {
        if (
          !user.friends.includes(req.body.id) &&
          req.user.id !== req.body.id
        ) {
          user.friends.unshift(req.body.id);
          user.save();
        }
      });
      User.findById(req.body.id).then((user) => {
        if (
          !user.followers.includes(req.user.id) &&
          req.user.id !== req.body.id
        ) {
          user.followers.unshift(req.user.id);
          user.save();
        }
      });
      res.json({ success: true });
    } catch (e) {
      res.json(e);
    }
  }
);

router.post(
  "/friendships/destroy",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      User.findById(req.user.id).then((user) => {
        if (user.friends.includes(req.body.id) && req.user.id !== req.body.id) {
          const index = user.friends.indexOf(req.body.id);
          user.friends.splice(index, 1);
          user.save();
        }
      });
      User.findById(req.body.id).then((user) => {
        if (
          user.followers.includes(req.user.id) &&
          req.user.id !== req.body.id
        ) {
          const index = user.followers.indexOf(req.user.id);
          user.followers.splice(index, 1);
          user.save();
        }
      });
      res.json({ success: true });
    } catch (e) {
      res.json(e);
    }
  }
);

// @route    GET api/users/friendships/:id
// @desc     View friendships of user
// @access   Private
router.get(
  "/friendships/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.params.id).then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ nouserfound: "No user found with the id" });
      }
      User.find({ _id: [...user.friends] }).then((users) => {
        res.json(users);
      });
    });
  }
);

// @route    GET api/users/followers/:id
// @desc     View followers of user
// @access   Private
router.get(
  "/followers/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.params.id).then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ nouserfound: "No user found with the id" });
      }
      User.find({ _id: [...user.followers] }).then((users) => {
        res.json(users);
      });
    });
  }
);

// @route    POST api/users/me
// @desc     Edit profile
// @access   Private
// router.patch(
//   "/users/me",
//   passport.authenticate("jwt", { session: false }),
//   async (req, res) => {
//     const updates = Object.keys(req.body);
//     const allowedUpdates = [
//       "name",
//       "email",
//       "password",
//       "dob",
//       "location",
//       "screen_name",
//       "url",
//       "description",
//     ];
//     const isValidOperation = updates.every((update) =>
//       allowedUpdates.includes(update)
//     );
//     if (!isValidOperation) {
//       return res.status(400).send({ error: "Invalid operation" });
//     }
//     try {
//       updates.forEach((update) => {
//         if (update === "password") {
//           let password = req.body.pasword
//           bcrypt.genSalt(10, (error, salt) => {
//             bcrypt.hash(password, salt, (err, hash) => {
//               if (err) {
//                 throw err;
//               }
//               password = hash;

//             });
//           });
//         }
//         req.user[update] = req.body[update];
//       });
//       await req.user.save();
//       if (!req.user) {
//         return res.status(404).send();
//       }
//       res.send(req.user);
//     } catch (e) {
//       res.status(400).send(e);
//     }
//   }
// );

module.exports = router;
