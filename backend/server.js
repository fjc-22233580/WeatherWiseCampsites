const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log("GEOAPIFY_KEY present:", !!process.env.GEOAPIFY_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/test", (req, res) => res.json({ ok: true }));

app.get("/api/locations/_direct", (req, res) => {
  res.json({ ok: true, where: "server.js direct /api/locations/_direct" });
});

//  require the route modules
const campsiteRoutes = require("./routes/campsiteRoutes");   
const locationsRoutes = require("./routes/locationsRoutes"); 

//  mount them (pass the router function, not an object)
app.use("/api/campsites", campsiteRoutes);
app.use("/api/locations", locationsRoutes);

// 404
app.use((req, res) => res.status(404).send("Not found"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));