"use strict";

function setFavicon(url) {
  let link = document.querySelector('link[rel="icon"]');

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = url;
}

setFavicon("/img/favicon.ico");

const config = {
  discord: {
    serverId: "1427472971785568340",
    // Using a CORS proxy to bypass client-side fetch restrictions from Discord's API.
    api: (id) => `https://api.allorigins.win/get?url=${encodeURIComponent(`https://discord.com/api/guilds/${id}/widget.json`)}`,
  },
  selectors: {
    navMenu: "#nav-menu",
    navToggle: ".nav-toggle",
    primaryNav: "#primary-nav",
    navLinks: "#nav-menu a",
    year: "#year",
    discordCount: "#discord-member-count",
    animatedElements: ".reveal-fade",
    scrollers: ".scroller",
    americaSection: "#america",
    footerAmericaLink: "#footer-america-link",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  updateYear();
  fetchDiscordMembers();
  initializeMobileMenu();
  initializeScrollAnimations();
  initializeScrollers();
  handleAmericaSectionVisibility();
});

/**
 * Updates the copyright year
 */
function updateYear() {
  const yearEl = document.querySelector(config.selectors.year);
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/**
 * Fetch Discord member count
 */
async function fetchDiscordMembers() {
  const countEl = document.querySelector(config.selectors.discordCount);
  if (!countEl) return;
  countEl.textContent = "Join the conversation!";
}

/**
 * Mobile Menu
 */
function initializeMobileMenu() {
  const navToggle = document.querySelector(config.selectors.navToggle);
  const primaryNav = document.querySelector(config.selectors.primaryNav);
  const navLinks = document.querySelectorAll(config.selectors.navLinks);

  if (!navToggle || !primaryNav) return;

  navToggle.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", !isExpanded);
  });
  
  // Close menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (document.body.classList.contains('nav-open')) {
            document.body.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
  });
}

/**
 * Scroll animations
 */
function initializeScrollAnimations() {
  const animated = document.querySelectorAll(config.selectors.animatedElements);
  if (!animated.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animated.forEach((el) => observer.observe(el));
}

/**
 * Scroller animations
 */
function initializeScrollers() {
  const scrollers = document.querySelectorAll(config.selectors.scrollers);
  if (!scrollers.length) return;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  scrollers.forEach((scroller) => {
    const inner = scroller.querySelector(".scroller__inner");
    if (!inner) return;
    if (isMobile) {
      const cards = Array.from(inner.querySelectorAll(".sponsor-card"));
      if (!cards.length) return;

      const updateCardStyles = () => {
        const scrollerCenter = scroller.scrollLeft + scroller.offsetWidth / 2;

        cards.forEach((card) => {
          const overlay = card.querySelector('.sponsor-card__overlay');
          if (!overlay) return;

          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const distance = Math.abs(scrollerCenter - cardCenter);

          // Animate when the card center is within a certain distance of the scroller center.
          // A distance of 1.5x card width feels about right for the fade effect.
          const fadeDistance = card.offsetWidth * 1.5;
          const opacity = Math.max(0, 1 - distance / fadeDistance);
          
          // Use a power function to make the fade in/out less linear.
          const effectiveOpacity = Math.pow(opacity, 2);

          overlay.style.opacity = effectiveOpacity;
          overlay.style.transform = `translateY(${(1 - opacity) * 20}%)`;
        });
      };

      // Use requestAnimationFrame for smooth, performant scroll animations.
      let ticking = false;
      scroller.addEventListener("scroll", () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateCardStyles();
            ticking = false;
          });
          ticking = true;
        }
      });
      
      // Set initial styles on load.
      setTimeout(updateCardStyles, 100);
    } else if (!reduce) {
      scroller.setAttribute("data-animated", true);
      const children = Array.from(inner.children);
      children.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", true);
        inner.appendChild(clone);
      });
    }
  });
}

/**
 * America section visibility
 */
async function handleAmericaSectionVisibility() {
  const section = document.querySelector(config.selectors.americaSection);
  const link = document.querySelector(config.selectors.footerAmericaLink);
  if (!section || !link) return;
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return;
    const data = await res.json();
    if (data.country_code === "US") {
      section.style.display = "block";
      link.style.display = "list-item";
    }
  } catch {
    /* silent */
  }
}