const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    verified: {
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

userSchema.virtual("statuses", {
  ref: "Statuses",
  localField: "_id",
  foreignField: "user",
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.email;
  return userObject;
};

// Delete user tasks when user is removed

userSchema.pre("remove", async function (next) {
  const user = this;
  await Statuses.deleteMany({ user: user.id });
  next();
});

module.exports = User = mongoose.model("User", userSchema);
