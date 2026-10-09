document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".top-nav");
  if (!nav) return;

  // Mobile nav toggle
  if (toggle) {
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Close the menu after tapping a link (mobile)
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      if (toggle) {
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  // Article pages: the sidebar lists the article's own sections
  const article = document.querySelector("article.article");
  const headings = article ? article.querySelectorAll(".article-body h2") : [];
  if (headings.length) {
    const intro = article.querySelector(".article-header");
    if (intro && !intro.id) intro.id = "article-top";
    const entries = [{ id: intro ? intro.id : "", label: "Introduction" }];
    headings.forEach(function (h, i) {
      if (!h.id) h.id = "section-" + (i + 1);
      entries.push({ id: h.id, label: h.textContent.trim() });
    });
    const ul = nav.querySelector("ul");
    ul.innerHTML = "";
    entries.forEach(function (e) {
      if (!e.id) return;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#" + e.id;
      a.textContent = e.label;
      li.appendChild(a);
      ul.appendChild(li);
    });
    nav.classList.add("toc");
    nav.setAttribute("aria-label", "Sections of this article");

    const back = document.createElement("a");
    back.className = "sidebar-back";
    back.href = "../";
    back.textContent = "← Homepage";
    nav.parentNode.insertBefore(back, nav);
  }

  // Sidebar dot: follows the section in view
  const list = nav.querySelector("ul");
  const dot = document.createElement("span");
  dot.className = "nav-dot";
  dot.setAttribute("aria-hidden", "true");
  list.appendChild(dot);

  const links = Array.from(nav.querySelectorAll("a"));
  const tracked = [];
  links
    .filter(function (a) { return a.getAttribute("href").charAt(0) === "#"; })
    .forEach(function (a) {
      const ids = [a.getAttribute("href").slice(1)];
      if (a.dataset.also) ids.push.apply(ids, a.dataset.also.split(" "));
      ids.forEach(function (id) {
        const el = id === "top" ? document.getElementById("hero") : document.getElementById(id);
        if (el) tracked.push({ link: a, el: el });
      });
    });
  tracked.sort(function (x, y) {
    return x.el.getBoundingClientRect().top - y.el.getBoundingClientRect().top;
  });

  function place(link) {
    if (!link) return;
    dot.style.transform = "translateY(" + (link.offsetTop + link.offsetHeight / 2) + "px)";
  }

  function setActive(link) {
    links.forEach(function (a) { a.classList.toggle("active", a === link); });
    place(link);
  }

  if (!tracked.length) {
    place(nav.querySelector("a.active"));
    return;
  }

  let current = null;
  function update() {
    const line = window.innerHeight * 0.35;
    let found = tracked[0];
    tracked.forEach(function (t) {
      if (t.el.getBoundingClientRect().top <= line) found = t;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      found = tracked[tracked.length - 1];
    }
    if (found.link !== current) {
      current = found.link;
      setActive(current);
    }
  }

  let ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", function () { place(current); });
  update();
});

// Phones: project cards and skill groups open on tap (CSS keeps them closed until then)
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".more-toggle, .skill-toggle");
  if (!btn) return;
  const box = btn.closest(".project-card, .skill-group, .role-item, .education-item");
  if (!box) return;
  const open = box.classList.toggle("is-open");
  btn.setAttribute("aria-expanded", open ? "true" : "false");
});

// Phones: a "Next" link at the end of each section
document.addEventListener("DOMContentLoaded", function () {
  const sections = Array.from(document.querySelectorAll("main section[id]")).filter(function (s) {
    return s.id !== "hero" && s.querySelector("h2.section-heading");
  });
  sections.forEach(function (section, i) {
    const next = sections[i + 1];
    if (!next) return;
    const label = next.querySelector("h2.section-heading").textContent.trim();
    const link = document.createElement("a");
    link.className = "next-link";
    link.href = "#" + next.id;
    link.textContent = "Next: " + label + " \u2193";
    section.appendChild(link);
  });
});
