const Chat = require("../models/Chat");

const getAllChats = async (req, res) => {
  const { id: user } = req.user;
  try {
    const chats = await Chat.find({ user });
    res.json(chats);
  } catch (err) {
    console.log(err);
  }
};

const deleteChat = async (req, res) => {
  const { chatId } = req.params;
  try {
    const result = await Chat.findByIdAndDelete(chatId);
    res.json(result);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getAllChats, deleteChat };
