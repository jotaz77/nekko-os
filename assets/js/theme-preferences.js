(function () {
  "use strict";
  const KEY = "nekko_os_theme";
  const valid = ["default", "dark", "light"];
  function get() {
    try { const value = localStorage.getItem(KEY); return valid.includes(value) ? value : "default"; }
    catch (_) { return "default"; }
  }
  function apply(value) {
    const theme = valid.includes(value) ? value : "default";
    if (theme === "default") document.documentElement.removeAttribute("data-nekko-theme");
    else document.documentElement.setAttribute("data-nekko-theme", theme);
    return theme;
  }
  function set(value) {
    const theme = valid.includes(value) ? value : "default";
    try { localStorage.setItem(KEY, theme); } catch (_) {}
    apply(theme);
    return theme;
  }
  apply(get());
  window.NekkoThemePreferences = { get, set, apply };
})();