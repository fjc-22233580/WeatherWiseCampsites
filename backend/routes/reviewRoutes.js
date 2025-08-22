 const express = require("express");
const router = express.Router();
const { requireAuth } = require("../utils/authMiddleware");
const {submitReviews, getReviewsSummary} = require("../controllers/reviewController");

router.put("/", requireAuth, submitReviews);
router.get("/:campsiteId", getReviewsSummary);


module.exports = router;