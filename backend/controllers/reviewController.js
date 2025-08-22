 const supabase = require("../services/supabaseClient");


async function getReviewsSummary(req, res) {
  try {
    const campsiteId = String(req.params.campsiteId || "").trim();
    if (!campsiteId) return res.status(400).json({ error: "campsiteId required" });

    const { data, error } = await supabase
      .from("reviews")
      .select("rating, comment, user_id, created_at")
      .eq("campsite_id", campsiteId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    const rows = data || [];
    const count = rows.length;
    const avg = count ? Number((rows.reduce((s, r) => s + (r.rating || 0), 0) / count).toFixed(2)) : 0;

    res.json({ campsite_id: campsiteId, avg, count, latest: rows });
  } catch (e) {
    console.error("[ratings:summary]", e);
    res.status(500).json({ error: "failed to fetch ratings" });
  }
}


async function submitReviews(req, res) {
  try {
    const { campsite_id, rating, comment } = req.body || {};
    if (!campsite_id || !rating) {
      return res.status(400).json({ error: "campsite_id and rating required" });
    }

    const clamped = Math.max(1, Math.min(5, Number(rating)));
    const row = {
      user_id: req.user.id,
      campsite_id: String(campsite_id),
      rating: clamped,
      comment: comment || null
    };

    
    const { data, error } = await supabase
      .from("reviews")
      .upsert(row, { onConflict: "user_id,campsite_id" })
      .select()
      .single();
 
   console.log("[submitReview] upsert returned:") 
   if (error) {
      console.error(" ratings upsert error:", error); // <— show exact reason
      return res.status(500).json({ error: "failed to submit rating", upstream: error.message || error });
    }

    return res.json({ ok: true, rating: data});
  } catch (e) {
    console.error(" ratings upsert exception:", e);
    return res.status(500).json({ error: "failed to submit rating", upstream: e.message || e });
  }
}

module.exports = { getReviewsSummary, submitReviews };

