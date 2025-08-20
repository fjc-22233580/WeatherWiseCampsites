// routes/campsiteRoutes.js
const express = require("express");
const router = express.Router();
const { searchCampsites } = require("../controllers/campsiteController");
// GET /api/campsites/search
router.get("/search", searchCampsites);
module.exports = router;