'use strict';

const TOTAL = 11; /* total number of vboxes */

/* ──────────────────────────────────────
   TEXT SEGMENTS
────────────────────────────────────── */
const SEGS = [
  { t: 'interaction',    kw: true,  i: 0 },
  { t: '-designer-chronically-' },
  { t: 'curious',        kw: true,  i: 1 },
  { t: '-about-how-' },
  { t: 'interfaces',     kw: true,  i: 2 },
  { t: '-shape-' },
  { t: 'human-behavior', kw: true,  i: 3 },
  { t: '-researching-the-science-of-' },
  { t: 'attention',      kw: true,  i: 4 },
  { t: '-and-still-getting-lost-by-scrolling-for-hours-with-music-in-her-ears' },
];

const ptextEl = document.getElementById('ptext');
SEGS.forEach(s => {
  if (s.kw) {
    const sp = document.createElement('span');
    sp.className   = 'kw';
    sp.textContent = s.t;
    ptextEl.appendChild(sp);
  } else {
    ptextEl.appendChild(document.createTextNode(s.t));
  }
});

/* ──────────────────────────────────────
   VIDEO BOXES — read from HTML
────────────────────────────────────── */
const boxes = Array.from(document.querySelectorAll('.vbox'));

/* Sound toggle */
let soundOn = false;
const soundBtn = document.getElementById('soundBtn');

soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? 'SOUND ON' : 'SOUND OFF';
  soundBtn.classList.toggle('on', soundOn);
  applySound();
});

function applySound() {
  let latestStage = -1;
  let latestVid   = null;

  boxes.forEach(el => {
    const stage = parseInt(el.dataset.stage, 10);
    if (el.classList.contains('on') && stage > latestStage) {
      latestStage = stage;
      latestVid   = el.querySelector('video');
    }
  });

  boxes.forEach(el => {
    const vid = el.querySelector('video');
    if (!vid) return;

    if (!el.classList.contains('on')) {
      /* hidden — mute completely */
      vid.muted  = true;
      vid.volume = 0;
    } else if (vid === latestVid) {
      /* newest visible — full volume */
      vid.muted  = !soundOn;
      vid.volume = soundOn ? 1 : 0;
    } else {
      /* older visible — low background volume */
      vid.muted  = !soundOn;
      vid.volume = soundOn ? 0.15 : 0;
    }
  });
}

/* ──────────────────────────────────────
   SCROLL — two full cycles
   First half:  videos appear  (stage 1→11)
   Second half: videos disappear (stage 11→1)
────────────────────────────────────── */
const PHASES = TOTAL * 2; /* total scroll steps */

let cur = -1;

function update(raw) {
  if (raw === cur) return;
  cur = raw;

  /* Which boxes are visible */
  boxes.forEach(el => {
    const stage = parseInt(el.dataset.stage, 10);
    const vid   = el.querySelector('video');
    let show;

    if (raw < TOTAL) {
      /* appearing phase: show boxes whose stage <= raw + 1 */
      show = stage <= raw + 1;
    } else {
      /* disappearing phase: hide boxes in reverse order */
      const disappearProgress = raw - TOTAL; /* 0 → TOTAL-1 */
      show = stage <= TOTAL - disappearProgress - 1;
    }

    el.classList.toggle('on', show);
    if (vid) {
      if (show) {
        vid.play().catch(() => {
          /* retry once after a short delay in case element wasn't ready */
          setTimeout(() => vid.play().catch(() => {}), 300);
        });
      } else {
        vid.pause();
      }
    }
  });

  applySound();

  /* safety pass — resume any visible video that stalled */
  boxes.forEach(el => {
    const vid = el.querySelector('video');
    if (vid && el.classList.contains('on') && vid.paused) {
      vid.play().catch(() => {});
    }
  });

  /* counter — show progress through full cycle */
  const cEl = document.getElementById('counter');
  if (raw >= 0) {
    cEl.textContent = `${String((raw % TOTAL) + 1).padStart(2, '0')} / ${String(TOTAL).padStart(2, '0')}`;
    cEl.classList.add('show');
  } else {
    cEl.classList.remove('show');
  }

  if (raw >= 0) document.getElementById('hint').style.opacity = '0';
}

/* ──────────────────────────────────────
   SCROLL HANDLER
   Page height = 900vh handles two full cycles
────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const stageH    = maxScroll / (PHASES + 1);
  const raw       = Math.floor(window.scrollY / stageH) - 1;
  update(Math.max(-1, Math.min(PHASES - 1, raw)));
}, { passive: true });

update(-1);
