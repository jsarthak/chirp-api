const router = require("express").Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Status model
const Status = require("../../models/Status");

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
// @desc     Get all Statuses for the user
// @access   Private

// @route    GET api/statuses/:id
// @desc     Get status by id
// @access   Private

// @route    POST api/statuses/like/:id
// @desc     Like status
// @access   Private

// @route    POST api/statuses/unlike/:id
// @desc     Unlike status
// @access   Private

// @route    POST api/statuses/repost/:id
// @desc     Repost status
// @access   Private

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

module.exports = router;
