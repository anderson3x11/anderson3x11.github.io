// Case pages: click (or Enter) on an image opens it full size in a <dialog>.
// Escape or a click anywhere closes it.
(function () {
  var dialog = document.createElement("dialog");
  dialog.className = "zoom";
  var big = document.createElement("img");
  dialog.appendChild(big);
  var reduced = matchMedia("(prefers-reduced-motion: reduce)");

  // Play the zoom-out animation, then actually close.
  function close() {
    if (dialog.classList.contains("closing")) return;
    if (reduced.matches) { dialog.close(); return; }
    dialog.classList.add("closing");
    big.addEventListener("animationend", function () {
      dialog.classList.remove("closing");
      dialog.close();
    }, { once: true });
  }
  dialog.addEventListener("click", close);
  dialog.addEventListener("cancel", function (e) { e.preventDefault(); close(); });
  document.body.appendChild(dialog);

  document.querySelectorAll(".shot img, .block img").forEach(function (img) {
    function open() {
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      dialog.showModal();
    }
    img.classList.add("zoomable");
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", document.documentElement.lang === "en" ? "Enlarge image" : "Agrandir l'image");
    img.addEventListener("click", open);
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });
})();
