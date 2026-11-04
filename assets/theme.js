// Theme manager: localStorage override > system preference.
// Sets <html data-theme="light|dark">; syncs giscus iframe if present.
// Also: off-page links open in a new tab (bottom of file).
(function () {
  var KEY = "theme";
  var mql = window.matchMedia("(prefers-color-scheme: dark)");
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function current() { return stored() || (mql.matches ? "dark" : "light"); }
  function apply(t) {
    document.documentElement.setAttribute("data-theme", t);
    var frame = document.querySelector("iframe.giscus-frame");
    if (frame && frame.contentWindow) {
      try {
        frame.contentWindow.postMessage(
          { giscus: { setConfig: { theme: t === "dark" ? "dark" : "light" } } },
          "https://giscus.app"
        );
      } catch (e) { /* cross-origin hiccup → ignore */ }
    }
  }
  if (mql.addEventListener) {
    mql.addEventListener("change", function () { if (!stored()) apply(current()); });
  }
  // giscus injects its iframe asynchronously — re-sync when it first messages us
  window.addEventListener("message", function (e) {
    if (e.origin === "https://giscus.app") apply(current());
  });
  document.addEventListener("DOMContentLoaded", function () {
    apply(current());
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, next); } catch (e) {}
      apply(next);
    });
  });
})();

// Links that leave the page open in a new tab. Site chrome (<nav>: top bar,
// pager, breadcrumbs, chapter prev/next), "← 返回" links and in-page anchors
// (TOC, #sec-…) keep navigating in place.
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest("a[href]");
  if (!a || a.target || a.closest("nav, .back-link")) return;
  if (!/^https?:$/.test(a.protocol)) return;
  if (a.host === location.host && a.pathname === location.pathname) return;
  a.target = "_blank";
  a.rel = "noopener";
});
