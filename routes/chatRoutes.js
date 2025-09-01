const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const { getAllChats, deleteChat } = require("../controllers/chatController");
const verifyChatUser = require("../middlewares/verifyChatUser");

router.get("/", verifyJWT, getAllChats);
router.delete("/:chatId", verifyJWT, verifyChatUser, deleteChat);
module.exports = router;
