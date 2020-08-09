const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Create Schema
const statusSchema = new Schema(
  {
    text: { type: String, required: true },
    in_reply_to_status_id: {
      type: Schema.Types.ObjectId,
    },
    is_repost: {
      type: Boolean,
      default: false,
    },
    repost_status_id: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    in_reply_to_user_id: {
      type: Schema.Types.ObjectId,
    },
    in_reply_to_user_screen_name: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    favorites: {
      type: [Schema.Types.ObjectId],
    },
    entities: {
      hashtags: {
        type: [String],
      },
      urls: [
        {
          url: { type: String },
        },
      ],
      user_mentions: {
        type: [String],
      },
      symbols: {
        type: [String],
      },
    },
  },
  { timestamps: true }
);

module.exports = Status = mongoose.model("Statuses", statusSchema);
