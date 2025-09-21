import { AuthPage } from "./pages/authPage.js";
import { PreferencesPage } from "./pages/preferencesPage.js";
import { SearchPage } from "./pages/searchPage.js";

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

// exposing a minimal router
const routes = {
  search: () => SearchPage(),
  preferences: () => PreferencesPage(),
  auth: () => AuthPage(),
};

const root = document.getElementById("app");

function render(el) {
  root.innerHTML = "";
  root.appendChild(el);
}

export const app = {
  navigate(name) {
    const view = routes[name] ? routes[name]() : SearchPage();
    render(view);
    history.pushState({ name }, "", `#/${name}`);
  },
};
window.app = app;

// simple hash routing
window.addEventListener("popstate", () => {
  const name = (location.hash.replace("#/", "") || "search");
  app.navigate(name);
});

document.addEventListener("DOMContentLoaded", () => {
  const initial = (location.hash.replace("#/", "") || "search");
  app.navigate(initial);
});
