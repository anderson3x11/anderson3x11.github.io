// Bilingual FR/EN content. The page ships in English in the HTML; this script
// swaps every [data-i18n] node when French is the active language.
(function () {
  var DICT = {
    en: {
      "meta.title": "Thomas C. · Web Developer & Cybersecurity",
      "meta.desc": "Thomas C. (anderson3x11), junior web developer specializing in cybersecurity, based in France. Building web apps and security tooling with React, Next.js, Python and Go. Open to CDI / CDD.",

      "nav.about": "About",
      "nav.skills": "Skills",
      "nav.projects": "Projects",
      "nav.ctf": "CTF",
      "nav.contact": "Contact",
      "nav.cta": "Get in touch",

      "hero.title": "Hi, I'm <em>Thomas</em><span class=\"cursor\"></span>",
      "hero.sub": "Junior web developer specializing in cybersecurity, based in France. I learn by doing, across dev, security, and personal projects like Shoryu and Pitstoppd.",
      "hero.highlight": "Open to full-time and fixed-term roles (CDI / CDD).",
      "hero.tag1": "web development",
      "hero.tag2": "react / next.js",
      "hero.tag3": "typescript / node",
      "hero.tag4": "cybersecurity",
      "hero.cta1": "get in touch",
      "hero.cta2": "see my work",

      "about.label": "about me",
      "about.title": "Background",
      "about.p1": "I'm a junior web developer with a specialization in cybersecurity. I started in IT through development, building small projects and learning how software works from the inside out, then found that security scratched the same itch and made everything click.",
      "about.p2": "I hold a Bachelor in Computer Science from Ynov (2023–2026), specializing in cybersecurity, earned after an earlier data analyst program. I'm comfortable on both sides of the stack : front and back with React, Next.js, Node, and TypeScript, and on security topics like web, network, and binary exploitation.",
      "about.p3": "The dev background stuck with me. I still write tools and side projects in Python, Go, JavaScript, and Bash, from Shoryu and Pitstoppd to smaller CLI tools. I find that <strong>building things</strong> is the best way to learn.",

      "skills.label": "skills & tools",
      "skills.title": "What I work with",
      "skills.languages": "languages",
      "skills.frameworks": "frameworks & data",
      "skills.tooling": "tooling & security",
      "skills.python": "Scripting & automation",
      "skills.bash": "Shell scripting",
      "skills.js": "Web development",
      "skills.ts": "Typed JavaScript",
      "skills.go": "Tooling & backends",
      "skills.php": "Web scripting",
      "skills.lua": "Neovim plugins",
      "skills.node": "Backend runtime",
      "skills.react": "UI library",
      "skills.next": "React framework",
      "skills.sql": "Databases & injection",
      "skills.postgres": "Relational databases",
      "skills.linux": "Primary OS",
      "skills.github": "Version control",
      "skills.burp": "Web proxy",
      "skills.nmap": "Network scanner",
      "skills.wireshark": "Packet analysis",
      "skills.ffuf": "Web fuzzer",

      "projects.label": "projects",
      "projects.title": "Things I've built",
      "projects.shoryu.cat": "Web app · Fighting games",
      "projects.shoryu.desc": "A stats platform for Street Fighter 6. Player profiles with LP/MR history, global leaderboards, tournament results, and matchup charts, all pulled live from the Buckler API and rendered into clean, sortable views.",
      "projects.pitstoppd.cat": "Web app · Formula 1",
      "projects.pitstoppd.desc": "A Letterboxd-style companion for Formula 1. Log every Grand Prix, rate and review the races, and keep a running diary of the season. A working proof of concept, not actively maintained and with no real users yet.",
      "projects.hermes.cat": "CLI tool · OSINT",
      "projects.hermes.desc": "A fast, concurrent username hunter written in Go. Give it a handle and it checks availability across dozens of sites in seconds, using goroutines to fan out requests in parallel.",
      "projects.fcbt.cat": "CLI tool · Password manager",
      "projects.fcbt.desc": "A local-first password manager with a no-nonsense CLI. Vaults are sealed with AES-256 and a key derived from your master password through a salted KDF, so nothing is ever stored or transmitted in plaintext.",
      "projects.nvim.cat": "Neovim plugin",
      "projects.nvim.desc": "A small Neovim plugin for switching colorschemes without leaving the editor. Browse installed themes in a picker and preview each one live as you move through the list.",
      "projects.respawn.cat": "Automation script",
      "projects.respawn.desc": "A post-install automation script for Arch Linux. One run bootstraps a fresh system: installs your package set, pulls AUR builds through yay, and deploys dotfiles and config so a reinstall takes minutes, not hours.",
      "projects.beekeep.cat": "Browser game",
      "projects.beekeep.desc": "A browser-based incremental game built from scratch to learn JavaScript. No frameworks, just the DOM, timers, and game-loop logic, growing a little bee empire one upgrade at a time.",
      "projects.banarby.cat": "Reference",
      "projects.banarby.desc": "A curated, categorized reference of IT-security tooling, cheatsheets, and learning material. A living bookmark list for pentesting, CTFs, and self-study.",

      "ctf.label": "ctf & writeups",
      "ctf.title": "Challenges & Writeups",
      "ctf.platforms": "platforms",
      "ctf.writeups": "writeups",
      "ctf.rootme.desc": "Web, network, cryptography, and binary exploitation challenges.",
      "ctf.voynich.desc": "CTF writeups and challenge breakdowns from Root-Me and beyond.",

      "contact.label": "contact",
      "contact.title": "Get in touch",
      "contact.linkedin.desc": "Professional profile",
      "contact.github.desc": "Code & projects"
    },

    fr: {
      "meta.title": "Thomas C. · Développeur web & cybersécurité",
      "meta.desc": "Thomas C. (anderson3x11), développeur web junior spécialisé en cybersécurité, basé en France. Applications web et outils de sécurité en React, Next.js, Python et Go. Ouvert aux offres CDI / CDD.",

      "nav.about": "À propos",
      "nav.skills": "Compétences",
      "nav.projects": "Projets",
      "nav.ctf": "CTF",
      "nav.contact": "Contact",
      "nav.cta": "Me contacter",

      "hero.title": "Salut, moi c'est <em>Thomas</em><span class=\"cursor\"></span>",
      "hero.sub": "Développeur web junior spécialisé en cybersécurité, basé en France. J'apprends en construisant, entre le dev, la sécurité et des projets perso comme Shoryu et Pitstoppd.",
      "hero.highlight": "Disponible pour un CDI ou un CDD.",
      "hero.tag1": "développement web",
      "hero.tag2": "react / next.js",
      "hero.tag3": "typescript / node",
      "hero.tag4": "cybersécurité",
      "hero.cta1": "me contacter",
      "hero.cta2": "voir mes projets",

      "about.label": "à propos",
      "about.title": "Parcours",
      "about.p1": "Je suis développeur web junior, spécialisé en cybersécurité. Je suis arrivé dans l'informatique par le développement, en montant de petits projets et en comprenant comment un logiciel fonctionne de l'intérieur, puis la sécurité a répondu à la même curiosité et tout s'est mis en place.",
      "about.p2": "Je suis titulaire d'un Bachelor Informatique d'Ynov (2023–2026), option cybersécurité, obtenu après un premier cursus de data analyst. Je suis à l'aise des deux côtés de la stack : front et back avec React, Next.js, Node et TypeScript, et sur les sujets sécurité comme le web, le réseau et l'exploitation binaire.",
      "about.p3": "Le réflexe dev ne m'a jamais quitté. J'écris toujours des outils et des projets perso en Python, Go, JavaScript et Bash, de Shoryu et Pitstoppd à de plus petits outils en ligne de commande. Pour moi, <strong>construire des choses</strong> reste la meilleure façon d'apprendre.",

      "skills.label": "compétences & outils",
      "skills.title": "Ce que j'utilise",
      "skills.languages": "langages",
      "skills.frameworks": "frameworks & données",
      "skills.tooling": "outils & sécurité",
      "skills.python": "Scripting & automatisation",
      "skills.bash": "Scripts shell",
      "skills.js": "Développement web",
      "skills.ts": "JavaScript typé",
      "skills.go": "Outils & backends",
      "skills.php": "Scripting web",
      "skills.lua": "Plugins Neovim",
      "skills.node": "Runtime backend",
      "skills.react": "Bibliothèque UI",
      "skills.next": "Framework React",
      "skills.sql": "Bases de données & injection",
      "skills.postgres": "Bases relationnelles",
      "skills.linux": "OS principal",
      "skills.github": "Gestion de versions",
      "skills.burp": "Proxy web",
      "skills.nmap": "Scanner réseau",
      "skills.wireshark": "Analyse de paquets",
      "skills.ffuf": "Fuzzer web",

      "projects.label": "projets",
      "projects.title": "Ce que j'ai construit",
      "projects.shoryu.cat": "App web · Jeux de combat",
      "projects.shoryu.desc": "Une plateforme de statistiques pour Street Fighter 6. Profils de joueurs avec historique LP/MR, classements mondiaux, résultats de tournois et tableaux de matchups, le tout récupéré en direct depuis l'API Buckler et affiché dans des vues claires et triables.",
      "projects.pitstoppd.cat": "App web · Formule 1",
      "projects.pitstoppd.desc": "Un Letterboxd de la Formule 1. On enregistre chaque Grand Prix, on note et commente les courses, et on garde un journal de la saison. Une preuve de concept fonctionnelle, plus vraiment maintenue et sans utilisateurs réels pour l'instant.",
      "projects.hermes.cat": "Outil CLI · OSINT",
      "projects.hermes.desc": "Un chercheur de pseudos rapide et concurrent, écrit en Go. On lui donne un pseudo et il vérifie sa disponibilité sur des dizaines de sites en quelques secondes, avec des goroutines qui lancent les requêtes en parallèle.",
      "projects.fcbt.cat": "Outil CLI · Gestionnaire de mots de passe",
      "projects.fcbt.desc": "Un gestionnaire de mots de passe local-first, piloté en ligne de commande. Les coffres sont chiffrés en AES-256 avec une clé dérivée du mot de passe maître via un KDF salé : rien n'est stocké ni transmis en clair.",
      "projects.nvim.cat": "Plugin Neovim",
      "projects.nvim.desc": "Un petit plugin Neovim pour changer de colorscheme sans quitter l'éditeur. On parcourt les thèmes installés dans un sélecteur et chacun s'affiche en direct au fil de la liste.",
      "projects.respawn.cat": "Script d'automatisation",
      "projects.respawn.desc": "Un script de post-installation pour Arch Linux. Une seule exécution prépare un système neuf : installation des paquets, builds AUR via yay, déploiement des dotfiles et des configs. Une réinstallation prend des minutes, plus des heures.",
      "projects.beekeep.cat": "Jeu navigateur",
      "projects.beekeep.desc": "Un jeu incrémental dans le navigateur, codé de zéro pour apprendre JavaScript. Aucun framework, juste le DOM, des timers et une boucle de jeu, pour faire grandir un petit empire d'abeilles amélioration après amélioration.",
      "projects.banarby.cat": "Référence",
      "projects.banarby.desc": "Une référence classée d'outils de sécurité, de cheatsheets et de ressources d'apprentissage. Une liste de favoris vivante pour le pentest, les CTF et l'auto-formation.",

      "ctf.label": "ctf & writeups",
      "ctf.title": "Challenges & writeups",
      "ctf.platforms": "plateformes",
      "ctf.writeups": "writeups",
      "ctf.rootme.desc": "Challenges web, réseau, cryptographie et exploitation binaire.",
      "ctf.voynich.desc": "Writeups de CTF et analyses de challenges, Root-Me et au-delà.",

      "contact.label": "contact",
      "contact.title": "Me contacter",
      "contact.linkedin.desc": "Profil professionnel",
      "contact.github.desc": "Code & projets"
    }
  };

  var STORAGE_KEY = "lang";

  function detect() {
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    if (saved === "fr" || saved === "en") return saved;

    // No stored choice yet: follow the browser's preferred languages.
    var prefs = navigator.languages || [navigator.language || "en"];
    for (var i = 0; i < prefs.length; i++) {
      var code = String(prefs[i]).toLowerCase();
      if (code.indexOf("fr") === 0) return "fr";
      if (code.indexOf("en") === 0) return "en";
    }
    return "en";
  }

  function apply(lang) {
    var dict = DICT[lang] || DICT.en;

    document.documentElement.lang = lang;
    document.title = dict["meta.title"];
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", dict["meta.desc"]);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = dict[el.getAttribute("data-i18n")];
      if (value != null) el.innerHTML = value;
    });

    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      var active = btn.getAttribute("data-lang-btn") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function init() {
    apply(detect());

    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang-btn");
        try {
          localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {}
        apply(lang);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
