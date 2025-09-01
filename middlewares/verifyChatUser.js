const Chat = require("../models/Chat");

const verifyChatUser = async (req, res, next) => {
  const { chatId } = req.params;
  const user = req?.user?.id;
  const chat = await Chat.findById(chatId);
  req.chat = chat;
  const isMatch = user.toString() === chat.user.toString();
  if (!isMatch)
    return res.status(403).json({ error: "No permission to access this chat" });
  next();
};

module.exports = verifyChatUser;
