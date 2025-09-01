const mongoose = require("mongoose");
const schema = mongoose.Schema;

const chatSchema = new schema({
  user: { type: schema.Types.ObjectId, ref: "User" },
  messages: [
    {
      role: { type: String, enum: ["AI", "User"] },
      text: String,
    },
  ],
});

module.exports = mongoose.model("Chat", chatSchema);
