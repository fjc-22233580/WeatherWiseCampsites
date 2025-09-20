import { AuthPage } from "./pages/authPage.js";
import { PreferencesPage } from "./pages/preferencesPage.js";

function mount(el, child){ el.innerHTML=""; el.appendChild(child); }
function markActive(id){
  document.querySelectorAll(".sidebar__button").forEach(a=>a.classList.remove("is-active"));
  document.getElementById(id)?.classList.add("is-active");
}

window.addEventListener("DOMContentLoaded", () => {
  const outlet = document.querySelector("#app");

  const goSignup = (e)=>{ e?.preventDefault(); mount(outlet, AuthPage({ mode:"signup" })); markActive("nav-auth-signup"); };
  const goLogin  = (e)=>{ e?.preventDefault(); mount(outlet, AuthPage({ mode:"login" }));  markActive("nav-auth-login"); };
  const goPrefs  = (e)=>{ e?.preventDefault(); mount(outlet, PreferencesPage());           markActive("nav-preferences"); };

  document.getElementById("nav-auth-signup")?.addEventListener("click", goSignup);
  document.getElementById("nav-auth-login") ?.addEventListener("click", goLogin);
  document.getElementById("nav-preferences")?.addEventListener("click", goPrefs);

  // Default route
  goSignup();
});
