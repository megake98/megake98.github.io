// Reading settings on detail pages: column width, font size, line height, contrast.
// Persists to localStorage "reader"; the inline prepaint snippet (THEME_PREPAINT in
// build_lib/post_assembly.py) re-applies it before first paint on every page.
(function () {
  var KEY = "reader";
  var OPTS = {
    rw: { label: "栏宽", def: "m", items: [["s", "窄"], ["m", "标准"], ["l", "宽"], ["full", "全宽"]] },
    rf: { label: "字号", def: "2", items: [["0", "小"], ["1", "较小"], ["2", "标准"], ["3", "大"], ["4", "特大"]] },
    rl: { label: "行距", def: "normal", items: [["tight", "紧凑"], ["normal", "标准"], ["loose", "宽松"]] },
    rc: { label: "配色", def: "normal", items: [["normal", "标准"], ["soft", "柔和"]] }
  };
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function apply(s) {
    for (var k in OPTS) document.documentElement.setAttribute("data-" + k, s[k] || OPTS[k].def);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("reader-toggle");
    if (!btn || !document.querySelector("main[data-pagefind-body]")) return;
    btn.hidden = false;
    var state = load();

    var panel = document.createElement("div");
    panel.className = "reader-panel";
    panel.id = "reader-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "阅读设置");
    var html = "";
    for (var k in OPTS) {
      html += '<div class="reader-panel__row"><span class="reader-panel__label">' + OPTS[k].label +
              '</span><div class="reader-panel__seg">';
      OPTS[k].items.forEach(function (it) {
        html += '<button type="button" data-k="' + k + '" data-v="' + it[0] + '">' + it[1] + "</button>";
      });
      html += "</div></div>";
    }
    html += '<button type="button" class="reader-panel__reset">恢复默认</button>';
    panel.innerHTML = html;
    btn.closest(".site-nav").appendChild(panel);

    function sync() {
      panel.querySelectorAll("[data-k]").forEach(function (b) {
        var cur = state[b.dataset.k] || OPTS[b.dataset.k].def;
        b.setAttribute("aria-pressed", String(cur === b.dataset.v));
      });
    }
    function setOpen(open) {
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
    }
    sync();

    panel.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("reader-panel__reset")) state = {};
      else state[b.dataset.k] = b.dataset.v;
      save(state);
      apply(state);
      sync();
    });
    btn.addEventListener("click", function (e) { e.stopPropagation(); setOpen(panel.hidden); });
    document.addEventListener("click", function (e) {
      if (!panel.hidden && !panel.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  });
})();
