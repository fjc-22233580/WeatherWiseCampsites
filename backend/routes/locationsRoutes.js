const express = require("express");
const router = express.Router();
const { searchLocations } = require("../controllers/locationsController"); // <-- named export

router.get("/", (_req, res) => res.json({ ok: true, where: "locations router root" }));
router.get("/search", searchLocations);

module.exports = router;
