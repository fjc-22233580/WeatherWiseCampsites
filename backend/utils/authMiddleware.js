 const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

async function attachUser(req, res, next) {
    try{
        const auth = req.headers.authorization || "";
        const token = auth.replace("Bearer ", "") ? auth.slice(7) : null;
        if (!token) {
            return next();
        }

        const {data, error} = await supabaseAuth.auth.getUser(token);
        if(error||!data.user) {
            return next();
        }
        
        req.user = {
            if: data.user.id,
            email: data.user.email,
            token,
        }
        next();
    }catch(e){
        next();
    }
}

function requireAuth(req, res, next) {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
    next();
}

module.exports = { attachUser, requireAuth };