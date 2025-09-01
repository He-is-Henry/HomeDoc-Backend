const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyJWT = require("../middlewares/verifyJWT");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/refresh", authController.handleRefresh);
router.get("/sessions", verifyJWT, authController.getSessions);
router.get("/logout", authController.logout);
router.post("/revoke", verifyJWT, authController.revokeSessions);
router.get("/profile", verifyJWT, authController.getProfile);
router.patch("/", verifyJWT, authController.editUser);
router.get("/", verifyJWT, authController.getAllUsers);

module.exports = router;
