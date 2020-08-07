const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Create Schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    screen_name: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 40,
    },
    location: {
      type: String,
    },
    url: {
      type: String,
    },
    description: {
      type: String,
    },
    protected: {
      type: Boolean,
      default: false,
    },
    varified: {
      type: Boolean,
      default: false,
    },
    followers: {
      type: [Schema.Types.ObjectId],
    },
    friends: {
      type: [Schema.Types.ObjectId],
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = User = mongoose.model("User", userSchema);
