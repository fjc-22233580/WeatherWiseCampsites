 const supabase = require("../services/supabaseClient");

async function listFavourites(req, res) {
  try {
    const { data, error } = await supabase
      .from("favourites")
      .select("campsite_id")
      .eq("user_id", req.user.id);

    if (error) throw error;
    res.json({ items: (data || []).map(r => r.campsite_id) });
  } catch (e) {
    console.error("[favourites] list error:", e);
    res.status(500).json({ error: "failed to list favourites" });
  }
}

async function toggleFavourite(req, res) {
  try {
    const campsiteId = String(req.params.campsiteId).trim();
    if (!campsiteId) return res.status(400).json({ error: "campsiteId required" });

    const { data: existing, error: qErr } = await supabase
      .from("favourites")
      .select("id")
      .eq("user_id", req.user.id)
      .eq("campsite_id", campsiteId)
      .maybeSingle();
    if (qErr) throw qErr;

    if (existing) {
      const { error: delErr } = await supabase.from("favourites").delete().eq("id", existing.id);
      if (delErr) throw delErr;
      return res.json({ campsite_id: campsiteId, isFavourite: false, action: "removed" });
    } else {
      const { error: insErr } = await supabase
        .from("favourites")
        .insert({ user_id: req.user.id, campsite_id: campsiteId });
      if (insErr) throw insErr;
      return res.json({ campsite_id: campsiteId, isFavourite: true, action: "added" });
    }
  } catch (e) {
    console.error("[favourites] toggle error:", e);
    res.status(500).json({ error: "failed to toggle favourite" });
  }
}

module.exports = { listFavourites, toggleFavourite };

