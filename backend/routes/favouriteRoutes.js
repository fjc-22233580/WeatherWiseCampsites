const express = require("express");
const router = express.Router();
const { requireAuth } = require("../utils/authMiddleware");
const { toggleFavourite, listFavourites } = require("../controllers/favouriteController");

router.get("/", requireAuth, listFavourites);
router.put("/:campsiteId", requireAuth, toggleFavourite);

module.exports = router;

