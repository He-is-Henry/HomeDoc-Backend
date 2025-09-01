const express = require("express");
const getDiagnosis = require("../controllers/symptomsController");
const verifyJWT = require("../middlewares/verifyJWT");
const router = express.Router();

router.post("/", verifyJWT, getDiagnosis);

module.exports = router;
