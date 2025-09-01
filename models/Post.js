const mongoose = require("mongoose");
const schema = mongoose.Schema;
const postSchma = new schema(
  {
    user: { type: schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    images: [String],
    anonymous: { type: Boolean, default: false },
    comments: [
      {
        User: String,
        text: String,
        image: String,
      },
    ],
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = postSchma;
