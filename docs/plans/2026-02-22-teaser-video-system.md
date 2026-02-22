# Teaser Video System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a time-driven teaser video system to the robot page with an urgent top banner counting down to the next drop, and permanent teaser cards in the V2 section.

**Architecture:** A single JS config array defines teaser dates/video IDs. One `requestAnimationFrame` loop (same pattern as existing V2 countdown) drives both the banner countdown and card visibility. CSS-only animations for glitch/pulse effects.

**Tech Stack:** Vanilla HTML/CSS/JS (matches existing codebase), YouTube thumbnail API for card backgrounds.

---

## Config

```js
const TEASERS = [
  { id: 1, videoId: 'nxTLGEAiAxM', date: new Date('2026-02-25T19:00:00-05:00') },
  { id: 2, videoId: 'ajdJyhFOOHs', date: new Date('2026-02-26T19:00:00-05:00') },
];
const REVEAL_DATE = new Date('2026-02-27T19:00:00-05:00');
```

---

### Task 1: Add teaser banner HTML

**Files:**
- Modify: `robot.html:556-584` (between `<body>` opening and `<main>`)

**Step 1: Add banner HTML after the header (line 583)**

Insert right after `</header>` (line 583), before `<main>` (line 585):

```html
<!-- Teaser Banner -->
<div class="teaser-banner" id="teaser-banner" style="display:none;">
  <div class="teaser-banner__content">
    <div class="teaser-banner__left">
      <span class="teaser-banner__pulse"></span>
      <span class="teaser-banner__label" id="teaser-banner-label">TEASER #1 DROPS IN</span>
    </div>
    <div class="teaser-banner__countdown" id="teaser-banner-countdown">
      <span class="teaser-banner__time" id="tb-hours">--</span>
      <span class="teaser-banner__sep">:</span>
      <span class="teaser-banner__time" id="tb-mins">--</span>
      <span class="teaser-banner__sep">:</span>
      <span class="teaser-banner__time" id="tb-secs">--</span>
    </div>
    <div class="teaser-banner__links" id="teaser-banner-links"></div>
  </div>
  <div class="teaser-banner__progress">
    <div class="teaser-banner__progress-bar" id="teaser-banner-progress"></div>
  </div>
</div>
```

**Step 2: Verify** - Open robot page in browser, banner should be hidden (display:none).

---

### Task 2: Add teaser banner CSS

**Files:**
- Modify: `robot.html` `<style>` block (add before the closing `</style>` tag at line 553)

**Step 1: Add banner styles**

Insert before `</style>` (line 553):

```css
/* ===== TEASER BANNER ===== */

.teaser-banner {
  position: sticky;
  top: var(--header-height);
  z-index: 99;
  background: linear-gradient(90deg, #0d0d0d 0%, #1a0a0a 50%, #0d0d0d 100%);
  border-bottom: 1px solid rgba(255, 51, 51, 0.3);
  overflow: hidden;
}

.teaser-banner__content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.teaser-banner__left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.teaser-banner__pulse {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: pulse-dot 1.5s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(255, 51, 51, 0.6);
}

.teaser-banner__label {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.teaser-banner__countdown {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.teaser-banner__time {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  min-width: 2ch;
  text-align: center;
}

.teaser-banner__sep {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-primary);
  opacity: 0.6;
}

.teaser-banner__links {
  display: flex;
  gap: 0.75rem;
}

.teaser-banner__link {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-primary);
  background: rgba(255, 51, 51, 0.15);
  border: 1px solid rgba(255, 51, 51, 0.3);
  padding: 0.3rem 0.75rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  text-decoration: none;
}

.teaser-banner__link:hover {
  background: rgba(255, 51, 51, 0.3);
  color: #fff;
}

.teaser-banner__progress {
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
}

.teaser-banner__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #ff6666);
  width: 0%;
  transition: width 1s linear;
}

/* Glitch flicker on banner */
@keyframes banner-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

.teaser-banner--flicker {
  animation: banner-flicker 0.1s steps(2) 5;
}

@media (max-width: 600px) {
  .teaser-banner__content {
    padding: 0.5rem 1rem;
    gap: 0.75rem;
    font-size: 0.85rem;
  }
  .teaser-banner__time {
    font-size: 1rem;
  }
  .teaser-banner__label {
    font-size: 0.7rem;
  }
}
```

**Step 2: Verify** - Banner should be styled correctly when made visible via devtools.

---

### Task 3: Add teaser cards HTML in V2 section

**Files:**
- Modify: `robot.html:707-770` (inside `.v2-teaser__content`, after the badge)

**Step 1: Add teaser cards container after the countdown div (line 755) and before the title (line 757)**

Insert between the countdown closing div (line 755) and the h2 title (line 757):

```html
<!-- Released Teaser Cards -->
<div class="teaser-cards" id="teaser-cards">
  <a class="teaser-card" id="teaser-card-1" href="https://www.youtube.com/watch?v=nxTLGEAiAxM" target="_blank" rel="noopener" style="display:none;">
    <div class="teaser-card__bg" style="background-image: url('https://img.youtube.com/vi/nxTLGEAiAxM/maxresdefault.jpg');"></div>
    <div class="teaser-card__overlay">
      <span class="teaser-card__number">TEASER #1</span>
      <svg class="teaser-card__play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
    </div>
  </a>
  <a class="teaser-card" id="teaser-card-2" href="https://www.youtube.com/watch?v=ajdJyhFOOHs" target="_blank" rel="noopener" style="display:none;">
    <div class="teaser-card__bg" style="background-image: url('https://img.youtube.com/vi/ajdJyhFOOHs/maxresdefault.jpg');"></div>
    <div class="teaser-card__overlay">
      <span class="teaser-card__number">TEASER #2</span>
      <svg class="teaser-card__play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
    </div>
  </a>
</div>
```

**Step 2: Verify** - Cards should be hidden by default.

---

### Task 4: Add teaser card CSS

**Files:**
- Modify: `robot.html` `<style>` block (add after the banner CSS from Task 2)

**Step 1: Add card styles**

```css
/* ===== TEASER CARDS ===== */

.teaser-cards {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.teaser-card {
  position: relative;
  width: 200px;
  height: 120px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 51, 51, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
  text-decoration: none;
  color: #fff;
}

.teaser-card:hover {
  transform: scale(1.05);
  border-color: var(--color-primary);
  color: #fff;
}

.teaser-card__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.4);
  transition: filter 0.2s ease;
}

.teaser-card:hover .teaser-card__bg {
  filter: brightness(0.55);
}

.teaser-card__overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.teaser-card__number {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(255, 51, 51, 0.5);
}

.teaser-card__play {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 6px rgba(255, 51, 51, 0.4));
  transition: transform 0.2s ease;
}

.teaser-card:hover .teaser-card__play {
  transform: scale(1.15);
}

@media (max-width: 500px) {
  .teaser-cards {
    flex-direction: column;
    align-items: center;
  }
  .teaser-card {
    width: 100%;
    max-width: 280px;
  }
}
```

**Step 2: Verify** - Manually show a card via devtools, should display YouTube thumbnail with dark overlay + text.

---

### Task 5: Add teaser JS logic

**Files:**
- Modify: `robot.html:799-933` (the existing `<script>` block)

**Step 1: Refactor the script block to include teaser config and banner logic**

Replace the entire IIFE script (lines 799-934) with an expanded version that:

1. Keeps the existing V2 countdown + clock + glitch exactly as-is
2. Adds the teaser config at the top
3. Adds a `updateBanner()` function inside the same `tick()` loop
4. Shows/hides teaser cards based on current time

The key logic:

```js
// === TEASER CONFIG ===
const TEASERS = [
  { id: 1, videoId: 'nxTLGEAiAxM', date: new Date('2026-02-25T19:00:00-05:00') },
  { id: 2, videoId: 'ajdJyhFOOHs', date: new Date('2026-02-26T19:00:00-05:00') },
];
const REVEAL_DATE = new Date('2026-02-27T19:00:00-05:00');

// Banner elements
const banner = document.getElementById('teaser-banner');
const bannerLabel = document.getElementById('teaser-banner-label');
const bannerLinks = document.getElementById('teaser-banner-links');
const tbHours = document.getElementById('tb-hours');
const tbMins = document.getElementById('tb-mins');
const tbSecs = document.getElementById('tb-secs');
const progressBar = document.getElementById('teaser-banner-progress');

function updateBanner() {
  const now = new Date();

  // After reveal - hide banner entirely
  if (now >= REVEAL_DATE) {
    banner.style.display = 'none';
    return;
  }

  banner.style.display = '';

  // Find the next upcoming teaser (or reveal)
  let nextEvent = null;
  let nextLabel = '';
  let prevStart = TEASERS[0].date; // for progress calc

  const releasedTeasers = TEASERS.filter(t => now >= t.date);
  const upcomingTeasers = TEASERS.filter(t => now < t.date);

  if (upcomingTeasers.length > 0) {
    nextEvent = upcomingTeasers[0];
    nextLabel = 'TEASER #' + nextEvent.id + ' DROPS IN';
    prevStart = releasedTeasers.length > 0
      ? releasedTeasers[releasedTeasers.length - 1].date
      : new Date(TEASERS[0].date.getTime() - 48 * 60 * 60 * 1000);
  } else {
    // All teasers released, count to reveal
    nextEvent = { date: REVEAL_DATE };
    nextLabel = 'REVEAL DROPS IN';
    prevStart = TEASERS[TEASERS.length - 1].date;
  }

  bannerLabel.textContent = nextLabel;

  // Countdown
  const diff = nextEvent.date - now;
  const totalH = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  tbHours.textContent = totalH.toString().padStart(2, '0');
  tbMins.textContent = m.toString().padStart(2, '0');
  tbSecs.textContent = s.toString().padStart(2, '0');

  // Progress bar (how far through this interval)
  const totalInterval = nextEvent.date - prevStart;
  const elapsed = now - prevStart;
  const pct = Math.min(100, Math.max(0, (elapsed / totalInterval) * 100));
  progressBar.style.width = pct + '%';

  // Released teaser links in banner
  bannerLinks.innerHTML = '';
  releasedTeasers.forEach(t => {
    const a = document.createElement('a');
    a.href = 'https://www.youtube.com/watch?v=' + t.videoId;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'teaser-banner__link';
    a.textContent = 'WATCH #' + t.id;
    bannerLinks.appendChild(a);
  });

  // Show/hide teaser cards in V2 section
  TEASERS.forEach(t => {
    const card = document.getElementById('teaser-card-' + t.id);
    if (card) card.style.display = now >= t.date ? '' : 'none';
  });
}
```

Then add `updateBanner()` inside the existing `tick()` function so it runs every frame alongside the clock/countdown.

**Step 2: Verify** - Temporarily change a teaser date to the past, reload, confirm banner shows countdown to next teaser and released card appears.

---

### Task 6: Final integration test

**Step 1:** Set all teaser dates to past temporarily, verify:
- Banner counts down to reveal
- Both teaser cards visible in V2 section
- "WATCH #1" and "WATCH #2" links appear in banner
- Links open YouTube in new tab

**Step 2:** Set all dates to future, verify:
- Banner counts down to teaser #1
- No teaser cards visible
- No watch links in banner

**Step 3:** Set reveal date to past, verify:
- Banner completely hidden
- Both cards visible

**Step 4:** Restore correct dates, commit.

```bash
git add robot.html
git commit -m "feat(robot): add teaser video countdown banner and cards"
```
