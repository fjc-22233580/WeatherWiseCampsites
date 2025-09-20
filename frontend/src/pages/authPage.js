// frontend/src/pages/authPage.js
import { signUp, signIn, signOut } from "../services/authService.js";
import { isAuthenticated, loadSession } from "../utils/storage.js";

function el(html){ const t=document.createElement("template"); t.innerHTML=html.trim(); return t.content.firstElementChild; }

export function AuthPage({ mode = "signup" } = {}) {
  const container = el(`
    <section class="panel">
      <div class="panel__header">
        <h2>Account</h2>
        <div class="tabs" role="tablist">
          <button class="tab" data-tab="signup">Create account</button>
          <button class="tab" data-tab="login">Log in</button>
        </div>
      </div>

      <div class="panel__content">
        <div class="auth__status" aria-live="polite"></div>

        <!-- SIGN UP -->
        <form class="auth__form auth__signup card" data-pane="signup">
          <h3>Create account</h3>
          <label class="field">
            <span class="label">Email</span>
            <input type="email" name="email" placeholder="bob@example.com" required />
          </label>
          <label class="field">
            <span class="label">Password</span>
            <input type="password" name="password" placeholder="At least 6 characters" required minlength="6" />
          </label>
          <p class="hint">You may need to verify via email depending on project settings.</p>
          <p class="error" hidden></p>
          <div class="panel__footer">
            <button type="submit" class="btn btn-primary">Create account</button>
          </div>
        </form>

        <!-- LOGIN -->
        <form class="auth__form auth__login card" data-pane="login">
          <h3>Log in</h3>
          <label class="field">
            <span class="label">Email</span>
            <input type="email" name="email" placeholder="bob@example.com" required />
          </label>
          <label class="field">
            <span class="label">Password</span>
            <input type="password" name="password" placeholder="•••••••" required />
          </label>
          <p class="error" hidden></p>
          <div class="panel__footer">
            <button type="submit" class="btn">Log in</button>
          </div>
        </form>

        <!-- LOGOUT -->
        <div class="auth__logout card" hidden>
          <p class="who"></p>
          <div class="panel__footer">
            <button class="btn btn-danger logoutBtn">Log out</button>
          </div>
          <p class="error" hidden></p>
        </div>
      </div>
    </section>
  `);

  const status = container.querySelector(".auth__status");
  const signUpForm = container.querySelector(".auth__signup");
  const loginForm = container.querySelector(".auth__login");
  const logoutBox = container.querySelector(".auth__logout");
  const who = container.querySelector(".who");

  function setStatus(msg, isError=false){ status.textContent = msg||""; status.className="auth__status"+(isError?" is-error":""); }
  function setError(block,msg){ const p=block.querySelector(".error"); if(!p) return; p.textContent=msg||""; p.hidden=!msg; }

  function showPane(which){
    for(const pane of container.querySelectorAll("[data-pane]")){
      pane.style.display = (pane.dataset.pane===which) ? "" : "none";
    }
    const tabs = container.querySelectorAll(".tab");
    tabs.forEach(b => b.classList.toggle("is-active", b.dataset.tab===which));
  }

  function reflectAuth(){
    if (isAuthenticated()){
      const session = loadSession();
      who.textContent = `Signed in as: ${session?.user?.email || "(unknown user)"}`;
      signUpForm.hidden = true;
      loginForm.hidden = true;
      logoutBox.hidden = false;
    } else {
      signUpForm.hidden = false;
      loginForm.hidden = false;
      logoutBox.hidden = true;
      showPane(mode); // default pane (signup/login)
    }
  }

  // tab clicks
  container.querySelectorAll(".tab").forEach(btn=>{
    btn.addEventListener("click", e => {
      e.preventDefault();
      mode = btn.dataset.tab;
      showPane(mode);
      setStatus("");
      container.querySelectorAll(".error").forEach(p=>p.hidden=true);
    });
  });

  // submit handlers
  signUpForm.addEventListener("submit", async (e)=>{
    e.preventDefault(); setError(signUpForm,null); setStatus("Creating account...");
    const f = new FormData(signUpForm);
    try { await signUp(f.get("email"), f.get("password")); setStatus("Sign-up successful. Check your email if confirmation is required."); reflectAuth(); signUpForm.reset(); }
    catch(err){ setStatus(""); setError(signUpForm, err.message || "Failed to sign up."); }
  });

  loginForm.addEventListener("submit", async (e)=>{
    e.preventDefault(); setError(loginForm,null); setStatus("Logging in...");
    const f = new FormData(loginForm);
    try { await signIn(f.get("email"), f.get("password")); setStatus("Logged in."); reflectAuth(); loginForm.reset(); }
    catch(err){ setStatus(""); setError(loginForm, err.message || "Failed to log in."); }
  });

  container.querySelector(".logoutBtn").addEventListener("click", async ()=>{
    setStatus("Logging out...");
    try { await signOut(); setStatus("Logged out."); reflectAuth(); }
    catch(err){ setStatus(""); setError(logoutBox, err.message || "Failed to log out."); }
  });

  reflectAuth();
  return container;
}
