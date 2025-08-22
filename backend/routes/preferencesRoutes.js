 const express = require("express");
const router = express.Router();
const { requireAuth } = require("../utils/authMiddleware");
const{getPreferences, upsertPreferences} = require("../controllers/preferencesController");

router.get("/", requireAuth, getPreferences);
router.put("/", requireAuth, upsertPreferences);

module.exports = router;