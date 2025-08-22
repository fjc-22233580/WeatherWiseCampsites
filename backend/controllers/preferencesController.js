 const supabase = require("../services/supabaseClient");

 async function getPreferences(req, res) {
   try {
     const { data, error } = await supabase
       .from("preferences")
       .select("*")
       .eq("user_id", req.user.id)
       .maybeSingle();

     if (error) throw error;
     res.json(data || {
        user_id: req.user.id,
        default_radius: 30000,
        preferred_weather:[],
        home_location: null,
     });
   } catch (e) {
     console.error("[preferences] get error:", e);
     res.status(500).json({ error: "failed to get preferences" });
   }
 }

 async function upsertPreferences(req, res){
    try{
        const { default_radius, preferred_weather, home_location } = req.body || {};

        const patch = {user_id: req.user.id};
    if (default_radius !== undefined) patch.default_radius = Number(default_radius);
    if (Array.isArray(preferred_weather)) patch.preferred_weather = preferred_weather;
    if (home_location !== undefined) patch.home_location = home_location;

    const { data, error } = await supabase
      .from("preferences")
      .upsert(patch)
      .select()
      .maybeSingle();

    if (error) throw error;
    res.json(data);
  } catch (e) {
    console.error("[preferences:upsert]", e);
    res.status(500).json({ error: "failed to upsert preferences" });
  }
}

module.exports = { getPreferences, upsertPreferences };