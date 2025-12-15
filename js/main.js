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
    teamGrid: "#team-members-grid",
  },
};

document.addEventListener("DOMContentLoaded", async () => {
  updateYear();
  fetchDiscordMembers();
  await loadTeamMembers(); // Wait for members to load before initializing animations
  initializeMobileMenu();
  initializeScrollAnimations();
  initializeScrollers();
  handleAmericaSectionVisibility();
  fetchVolunteerHours();

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
 * Load team members from JSON and populate the grid
 */
async function loadTeamMembers() {
  const grid = document.querySelector(config.selectors.teamGrid);
  if (!grid) return;

  try {
    // Add cache-busting query parameter to ensure the latest file is fetched
    const response = await fetch(`members.json?v=${new Date().getTime()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const members = data.members;

    if (members && members.length > 0) {
      grid.innerHTML = members.map(member => {
        // More robust logic to ensure titles is always an array of valid strings
let titles = [];

if (Array.isArray(member.titles)) {
    titles = member.titles
        .filter(t => typeof t === "string" && t.trim() !== "");
} else if (typeof member.titles === "string" && member.titles.trim() !== "") {
    titles = [member.titles.trim()];
} else if (typeof member.title === "string" && member.title.trim() !== "") {
    titles = [member.title.trim()];
}

        return `
        <div class="team-card reveal-fade">
          <div class="team-card__image-wrapper">
              <img src="${member.img}" alt="Headshot of ${member.name}" class="team-card__image" loading="lazy" />
          </div>
          <div class="team-card__info">
              <h4 class="team-card__name">${member.name}</h4>
              <div class="team-card__roles-container" data-role-count="${Array.isArray(titles) ? titles.length : 0}">
  ${
    Array.isArray(titles)
      ? titles.map(title => `<span class="team-card__role">${title || ''}</span>`).join('')
      : ''
  }
</div>
          </div>
        </div>
      `}).join('');

      initializeRoleCarousels();
    } else {
      grid.innerHTML = "<p>Team member information is currently unavailable.</p>";
    }
  } catch (error) {
    console.error("Failed to load team members:", error);
    grid.innerHTML = "<p>There was an error loading team member data.</p>";
  }
}

/**
 * Initializes the rotating role animations for team members.
 */
function initializeRoleCarousels() {
  document.querySelectorAll('.team-card__roles-container').forEach(container => {
    const roles = container.querySelectorAll('.team-card__role');
    const roleCount = roles.length;

    if (roleCount <= 1) {
      if (roles.length > 0) roles[0].classList.add('is-active');
      return;
    }

    let activeIndex = 0;
    roles[activeIndex].classList.add('is-active');

    if (roleCount === 2) {
      let direction = 1; // 1 for forward (standard), -1 for backward (reverse)
      // Initial state: role 0 is active, role 1 is next
      roles[1].classList.add('is-next');

      setInterval(() => {
        const prevActiveIndex = activeIndex;
        activeIndex = (activeIndex + 1) % roleCount;

        roles.forEach(r => r.classList.remove('is-active', 'is-prev', 'is-next'));

        roles[activeIndex].classList.add('is-active');
        
        if (direction === 1) {
            // Standard transition: active role moves to 'prev'
            roles[prevActiveIndex].classList.add('is-prev');
        } else {
            // Reverse transition: active role moves to 'next'
            roles[prevActiveIndex].classList.add('is-next');
        }
        
        // Flip direction for the next cycle
        direction *= -1;
      }, 2000);

    } else { // 3+ roles
      // Standard carousel initial state
      roles[1].classList.add('is-next');
      roles[roleCount - 1].classList.add('is-prev');

      setInterval(() => {
        activeIndex = (activeIndex + 1) % roleCount;
        
        roles.forEach((role, index) => {
          role.classList.remove('is-active', 'is-prev', 'is-next');

          const prevIndex = (activeIndex - 1 + roleCount) % roleCount;
          const nextIndex = (activeIndex + 1) % roleCount;

          if (index === activeIndex) {
            role.classList.add('is-active');
          } else if (index === prevIndex) {
            role.classList.add('is-prev');
          } else if (index === nextIndex) {
            role.classList.add('is-next');
          }
        });
      }, 2000);
    }
  });
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