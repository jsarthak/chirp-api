const router = require("express").Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Status model
const Status = require("../../models/Status");
// User model
const User = require("../../models/User");

// validation
const validatePostStatus = require("../../validation/status");

// @route    GET api/statuses/test
// @desc     Tests post route
// @access   Public
router.get("/test", (req, res) => {
  res.status(200).json({
    message: "Statuses works",
  });
});

// @route    POST api/statuses/
// @desc     Create new Status
// @access   Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errros, isValid } = validatePostStatus(req.body);
    // check validaton
    if (!isValid) {
      return res.status(400).json(errros);
    }
    const newStatus = new Status({
      text: req.body.text,
      user: req.user.id,
    });
    newStatus.save().then((status) => res.json(status));
  }
);

// @route    GET api/statuses/
// @desc     Get all Statuses of users's friends
// @access   Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user.id).then((user) => {
      if (!user) {
        return res.status(404).json({ usernotfound: "No user found" });
      }

      Status.find({ user: [...user.friends] }).then((statuses) => {
        res.json(statuses);
      });
    });
  }
);

// @route    GET api/statuses/users/:id
// @desc     Get all Statuses by user id
// @access   Public
router.get("/users/:id", (req, res) => {
  Status.find({ user: req.params.id })
    .sort({ created_at: -1 })
    .then((statuses) => {
      res.json(statuses);
    })
    .catch((err) => {
      res.status(404).json({ nopostsfound: "No posts found" });
    });
});

// @route    GET api/statuses/:id
// @desc     Get status by id
// @access   Public
router.get("/status/:id", (req, res) => {
  Status.findById(req.params.id)
    .then((status) => {
      res.json(status);
    })
    .catch((err) => {
      res.send(404).json({ nopostfound: "No status update found with id" });
    });
});

// @route    POST api/statuses/like/:id
// @desc     Like status
// @access   Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findOne({ user: req.user.id }).then((user) => {
      Status.findById(req.params.id)
        .then((status) => {
          if (status.favorites.includes(req.user.id)) {
            return res
              .status(400)
              .json({ alreadyLiked: "User already liked this post" });
          }
          status.favorites.unshift(req.user.id);
          status.save().then((status) => res.json(status));
        })
        .catch((err) =>
          res.status(404).json({
            postnotfound: "No post found",
          })
        );
    });
  }
);

// @route    POST api/statuses/unlike/:id
// @desc     Unlike status
// @access   Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findOne({ user: req.user.id }).then((user) => {
      Status.findById(req.params.id)
        .then((status) => {
          if (!status.favorites.includes(req.user.id)) {
            return res
              .status(400)
              .json({ notliked: "You have not liked this post" });
          }
          const removeIndex = status.favorites.map((item) =>
            item.toString().indexOf(req.user.id.toString())
          );
          status.favorites.splice(removeIndex, 1);
          status.save().then((status) => res.json(status));
        })
        .catch((err) =>
          res.status(404).json({
            postnotfound: "No post found",
          })
        );
    });
  }
);

// @route    POST api/statuses/repost/:id
// @desc     Repost status
// @access   Private
router.post(
  "/repost/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Status.findById(req.params.id)
      .then((status) => {
        if (status) {
          const newStatus = new Status({
            text: status.text,
            user: req.user.id,
            is_repost: true,
            repost_status_id: status._id,
          });
          status.save().then((status) => res.json(status));
        }
      })
      .catch((err) => {
        res.status(404).json({
          postnotfound: "No post found",
        });
      });
  }
);

// @route    POST api/statuses/reply/:id
// @desc     Reply to status
// @access   Private
router.post(
  "/reply/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errros, isValid } = validatePostStatus(req.body);
    // check validaton
    if (!isValid) {
      return res.status(400).json(errros);
    }
    const newStatus = new Status({
      text: req.body.text,
      user: req.user.id,
      in_reply_to_status_id: req.params.id,
      in_reply_to_user_id: req.body.in_reply_to_user_id,
      in_reply_to_user_screen_name: req.body.in_reply_to_user_screen_name,
    });
    newStatus.save().then((status) => res.json(status));
  }
);

// @route    Get api/statuses/reply/:id
// @desc     Get Reply to status
// @access   Public
router.get("/reply/:id", (req, res) => {
  Status.find({ in_reply_to_status_id: req.params.id }).then((statuses) => {
    res.json(statuses);
  });
});

module.exports = router;
