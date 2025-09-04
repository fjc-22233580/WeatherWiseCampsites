require("dotenv").config();
const express = require("express");
const cors = require("cors");
console.log("GEOAPIFY_KEY present:", !!process.env.GEOAPIFY_KEY);
console.log("SUPABASE_URL seen in server.js:", process.env.SUPABASE_URL);

const { attachUser, requireAuth } = require("./utils/authMiddleware");
const app = express();
app.use(cors());
app.use(express.json());
app.use(attachUser); // Attach user info to req.user if authenticated

// Health check
app.get("/api/test", (req, res) => res.json({ ok: true }));
app.get("/api/me", requireAuth, (req, res) => res.json({ user: req.user }));

app.get("/api/locations/_direct", (req, res) => {
  res.json({ ok: true, where: "server.js direct /api/locations/_direct" });
});

//  require the route modules
const campsiteRoutes = require("./routes/campsiteRoutes");   
const locationsRoutes = require("./routes/locationsRoutes"); 
const favouriteRoutes = require("./routes/favouriteRoutes");
const preferencesRoutes = require("./routes/preferencesRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
//  mount them (pass the router function, not an object)
app.use("/api/campsites", campsiteRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/preferences", preferencesRoutes);
app.use("/api/reviews", reviewRoutes);
// 404
app.use((req, res) => res.status(404).send("Not found"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));