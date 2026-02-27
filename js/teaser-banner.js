(function() {
  var TEASERS = [
    { id: 1, videoId: 'nxTLGEAiAxM', date: new Date('2026-02-25T19:00:00-05:00') },
    { id: 2, videoId: 'ajdJyhFOOHs', date: new Date('2026-02-26T19:00:00-05:00') },
    { id: 3, videoId: 'nZXtCzvyQgk', date: new Date('2026-02-27T19:00:00-05:00') },
  ];
  var REVEAL_DATE = new Date('2026-02-27T19:00:00-05:00');

  // Don't show if reveal already passed
  if (new Date() >= REVEAL_DATE) return;

  // Inject CSS
  var style = document.createElement('style');
  style.textContent = [
    '.teaser-banner{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);z-index:90;background:rgba(13,13,13,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,51,51,0.25);border-radius:50px;box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 20px rgba(255,51,51,0.1);overflow:hidden}',
    '.teaser-banner__content{padding:0.6rem 1.25rem;display:flex;align-items:center;gap:1rem;white-space:nowrap}',
    '.teaser-banner__left{display:flex;align-items:center;gap:0.5rem}',
    '.teaser-banner__pulse{width:6px;height:6px;background:var(--color-primary,#ff3333);border-radius:50%;animation:tb-pulse 1.5s ease-in-out infinite;box-shadow:0 0 8px rgba(255,51,51,0.6);flex-shrink:0}',
    '@keyframes tb-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}',
    '.teaser-banner__label{font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-primary,#ff3333)}',
    '.teaser-banner__countdown{display:flex;align-items:center;gap:0.15rem}',
    '.teaser-banner__time{font-size:1.1rem;font-weight:800;color:var(--color-text-primary,#f0f0f0);font-variant-numeric:tabular-nums;min-width:2ch;text-align:center}',
    '.teaser-banner__sep{font-size:1.1rem;font-weight:800;color:var(--color-primary,#ff3333);opacity:0.5}',
    '.teaser-banner__links{display:flex;gap:0.5rem}',
    '.teaser-banner__link{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--color-text-primary,#f0f0f0);background:rgba(255,51,51,0.15);border:1px solid rgba(255,51,51,0.3);padding:0.25rem 0.6rem;border-radius:50px;transition:all 0.2s ease;text-decoration:none}',
    '.teaser-banner__link:hover{background:rgba(255,51,51,0.3);color:#fff}',
    '.teaser-banner__progress{height:2px;background:rgba(255,255,255,0.05)}',
    '.teaser-banner__progress-bar{height:100%;background:linear-gradient(90deg,var(--color-primary,#ff3333),#ff6666);width:0%;transition:width 1s linear}',
    '@media(max-width:600px){.teaser-banner{bottom:1rem;left:1rem;right:1rem;transform:none;border-radius:16px}.teaser-banner__content{padding:0.5rem 1rem;gap:0.6rem;flex-wrap:wrap;justify-content:center;white-space:normal}.teaser-banner__time{font-size:1rem}.teaser-banner__label{font-size:0.65rem}}'
  ].join('\n');
  document.head.appendChild(style);

  // Inject HTML
  var banner = document.createElement('div');
  banner.className = 'teaser-banner';
  banner.id = 'teaser-banner';
  banner.innerHTML =
    '<div class="teaser-banner__content">' +
      '<div class="teaser-banner__left">' +
        '<span class="teaser-banner__pulse"></span>' +
        '<span class="teaser-banner__label" id="teaser-banner-label">TEASER #1 DROPS IN</span>' +
      '</div>' +
      '<div class="teaser-banner__countdown">' +
        '<span class="teaser-banner__time" id="tb-hours">--</span>' +
        '<span class="teaser-banner__sep">:</span>' +
        '<span class="teaser-banner__time" id="tb-mins">--</span>' +
        '<span class="teaser-banner__sep">:</span>' +
        '<span class="teaser-banner__time" id="tb-secs">--</span>' +
      '</div>' +
      '<div class="teaser-banner__links" id="teaser-banner-links"></div>' +
    '</div>' +
    '<div class="teaser-banner__progress">' +
      '<div class="teaser-banner__progress-bar" id="teaser-banner-progress"></div>' +
    '</div>';
  document.body.appendChild(banner);

  // Grab refs
  var label = document.getElementById('teaser-banner-label');
  var links = document.getElementById('teaser-banner-links');
  var tbH = document.getElementById('tb-hours');
  var tbM = document.getElementById('tb-mins');
  var tbS = document.getElementById('tb-secs');
  var bar = document.getElementById('teaser-banner-progress');
  var lastKey = '';

  function update() {
    var now = new Date();
    if (now >= REVEAL_DATE) { banner.style.display = 'none'; return; }

    var released = TEASERS.filter(function(t) { return now >= t.date; });
    var upcoming = TEASERS.filter(function(t) { return now < t.date; });
    var next, text, prev;

    if (upcoming.length > 0) {
      next = upcoming[0];
      text = 'TEASER #' + next.id + ' DROPS IN';
      prev = released.length > 0 ? released[released.length - 1].date : new Date(TEASERS[0].date.getTime() - 48 * 3600000);
    } else {
      next = { date: REVEAL_DATE };
      text = 'REVEAL DROPS IN';
      prev = TEASERS[TEASERS.length - 1].date;
    }

    label.textContent = text;

    var diff = next.date - now;
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    tbH.textContent = h.toString().padStart(2, '0');
    tbM.textContent = m.toString().padStart(2, '0');
    tbS.textContent = s.toString().padStart(2, '0');

    var pct = Math.min(100, Math.max(0, ((now - prev) / (next.date - prev)) * 100));
    bar.style.width = pct + '%';

    var key = released.map(function(t) { return t.id; }).join(',');
    if (key !== lastKey) {
      lastKey = key;
      links.innerHTML = '';
      released.forEach(function(t) {
        var a = document.createElement('a');
        a.href = 'https://www.youtube.com/watch?v=' + t.videoId;
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'teaser-banner__link';
        a.textContent = 'WATCH #' + t.id;
        links.appendChild(a);
      });
    }

    requestAnimationFrame(update);
  }

  update();
})();
