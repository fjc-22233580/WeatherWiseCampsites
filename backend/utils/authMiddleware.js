const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in env (authMiddleware)");
}

const supabaseAuth = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});

async function attachUser(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return next();

    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data?.user) return next();

    req.user = {
      id: data.user.id,          
      email: data.user.email || null,
      token,
    };
    next();
  } catch (e) {
    next(); 
  }
}

function requireAuth(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorised" });
  next();
}

module.exports = { attachUser, requireAuth, supabaseAuth };