const express = require("express");
const router = express.Router();
const { askCohere } = require("../controllers/aiController");
const verifyJWT = require("../middlewares/verifyJWT");

router.post("/ask", verifyJWT, askCohere);

module.exports = router;
