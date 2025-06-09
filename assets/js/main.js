// Content loading
async function loadContent(page) {
    const contentElement = document.getElementById("content");
    const response = await fetch(`partials/${page}.html`);
    const html = await response.text();
    contentElement.innerHTML = html;
}

// Navigation and active link handling
function setActiveLink(page) {
    document.querySelectorAll("nav a").forEach((link) => {
        link.classList.remove("bg-white/5");
        if (link.getAttribute("href") === `#${page}`) {
            link.classList.add("bg-white/5");
        }
    });
}

// Route handling
async function handleRoute() {
    const page = location.hash.replace("#", "") || "home";
    await loadContent(page);
    setActiveLink(page);
}

// Event listeners
window.addEventListener("hashchange", handleRoute);
window.addEventListener("DOMContentLoaded", handleRoute); 