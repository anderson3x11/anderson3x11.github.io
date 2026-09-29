// FR/EN: both languages live in the HTML (class="fr" / class="en"),
// CSS hides the inactive one based on <html data-lang>. Loaded in <head>
// without defer so the right language is set before first paint.
(function () {
  var KEY = "lang";
  var root = document.documentElement;

  function detect() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "fr" || saved === "en") return saved;
    } catch (e) {}
    var prefs = navigator.languages || [navigator.language || "en"];
    for (var i = 0; i < prefs.length; i++) {
      var code = String(prefs[i]).toLowerCase();
      if (code.indexOf("fr") === 0) return "fr";
      if (code.indexOf("en") === 0) return "en";
    }
    return "en";
  }

  function apply(lang) {
    root.setAttribute("data-lang", lang);
    root.lang = lang;
    var title = document.querySelector("title");
    if (title && title.dataset[lang]) document.title = title.dataset[lang];
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang-btn") === lang ? "true" : "false");
    });
  }

  apply(detect());

  document.addEventListener("DOMContentLoaded", function () {
    apply(root.getAttribute("data-lang"));
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang-btn");
        try { localStorage.setItem(KEY, lang); } catch (e) {}
        apply(lang);
      });
    });
  });
})();
