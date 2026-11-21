/* ===== EDIT YOUR DETAILS HERE ===== */
const CONFIG = {
  date: '2026-12-10T10:00:00+05:30',            // countdown target (first event)
  families: '',                                  // optional blessing line, e.g. 'With the blessings of the Sharma and Verma families'
  venues: {
    sawariya: { name: 'Sawariya Palace', addr: 'Cat Road, Indore', q: 'Sawariya Palace, Cat Road, Indore' },
    step7:    { name: '7 Step Garden',   addr: 'Hawa Bangla, Cat Road, Indore', q: '7 Step Garden, Hawa Bangla, Cat Road, Indore' },
    milan:    { name: 'Milan Sundaram Garden', addr: 'Milan Sundaram Garden, Indore', q: 'Milan Sundaram Garden, Indore' }
  },
  events: [
    { name: 'Mata Poojan', date: 'Thursday, 10 December', time: '10:00 AM', venue: 'sawariya', note: 'An auspicious beginning, with blessings.', ics: ['20261210T100000', '20261210T120000'] },
    { name: 'Sangeet',     date: 'Thursday, 10 December', time: '7:00 PM',  venue: 'sawariya', note: 'An evening of music, dance and joy.',     ics: ['20261210T190000', '20261210T230000'] },
    { name: 'Baarat',     date: 'Friday, 11 December', time: '4:00 PM',  venue: 'milan',    note: 'Come celebrate and join the baarat.', ics: ['20261211T160000', '20261211T190000'] },
    { name: 'Wedding Ceremony', date: 'Friday, 11 December', time: '3:00 AM', venue: 'milan', note: 'Join us as we celebrate the wedding of Shashank and Garima.', ics: ['20261211T030000', '20261211T060000'] },
    { name: 'Reception',   date: 'Sunday, 13 December',   time: '7:00 PM',  venue: 'step7',    note: 'An evening to celebrate together.',      ics: ['20261213T190000', '20261213T230000'] }
  ]
};
/* ================================== */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// name letters animate in once the curtains open
$$('[data-split]').forEach(el => {
  const t = el.textContent; el.setAttribute('aria-label', t);
  el.innerHTML = [...t].map((c, i) => c === ' ' ? ' ' : `<span class="ch" style="--i:${i}" aria-hidden="true">${c}</span>`).join('');
});

// curtains + music
const song = $('#song'), music = $('#music');
$('#open').onclick = () => {
  $('#curtain').classList.add('open');
  document.body.classList.replace('locked', 'opened');
  setTimeout(() => $('#curtain').classList.add('gone'), 2300);
  song.volume = 0;
  song.play().then(() => {
    music.hidden = false; music.classList.add('on');
    let v = 0; const f = setInterval(() => { v = Math.min(.8, v + .04); song.volume = v; if (v >= .8) clearInterval(f); }, 150);
  }).catch(() => {});
};
music.onclick = () => { song.paused ? song.play() : song.pause(); music.classList.toggle('on', !song.paused); };

// countdown
const target = new Date(CONFIG.date);
function tick() {
  const d = Math.max(0, target - Date.now());
  const v = { days: d / 864e5 | 0, hours: d / 36e5 % 24 | 0, mins: d / 6e4 % 60 | 0, secs: d / 1e3 % 60 | 0 };
  for (const k in v) {
    const el = $('#' + k), s = String(v[k]).padStart(2, '0');
    if (el.textContent !== s) { el.textContent = s; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  }
}
setInterval(tick, 1000); tick();

// add to calendar (.ics)
$('#cal').onclick = () => {
  const ev = CONFIG.events.map((e, i) => ['BEGIN:VEVENT', `UID:sg-2026-${i}@wedding`, 'DTSTAMP:20261115T000000Z',
    `DTSTART;TZID=Asia/Kolkata:${e.ics[0]}`, `DTEND;TZID=Asia/Kolkata:${e.ics[1]}`,
    `SUMMARY:${e.name} – Shashank & Garima`, 'LOCATION:' + CONFIG.venues[e.venue].q.replace(/,/g, '\\,'), 'END:VEVENT'].join('\r\n'));
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding//EN', ...ev, 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'shashank-garima-wedding.ics'; a.click();
};

// photo carousel
const slides = $$('#photoSlides .slide'), dots = $('#photoDots'), photoCount = $('#photoCount');
let currentSlide = 0, slideshowPaused = calm;
function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    const active = i === currentSlide;
    slide.hidden = !active;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    slide.setAttribute('aria-hidden', String(!active));
    dots.children[i].setAttribute('aria-current', String(active));
  });
  photoCount.textContent = `${currentSlide + 1} / ${slides.length}`;
}
dots.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Show photo ${i + 1}" aria-current="false"></button>`).join('');
$('#photoPrev').onclick = () => showSlide(currentSlide - 1);
$('#photoNext').onclick = () => showSlide(currentSlide + 1);
dots.onclick = e => {
  const button = e.target.closest('button');
  if (button) showSlide([...dots.children].indexOf(button));
};
$('#photoPause').hidden = calm;
$('#photoPause').onclick = e => {
  slideshowPaused = !slideshowPaused;
  e.currentTarget.textContent = slideshowPaused ? 'Play slideshow' : 'Pause slideshow';
};
showSlide(0);
setInterval(() => {
  if (!slideshowPaused && !document.hidden) showSlide(currentSlide + 1);
}, 5000);

function updateTimelineDraw() {
  const tl = $('#tl').getBoundingClientRect();
  $('#tl').style.setProperty('--draw', Math.min(1, Math.max(0, (innerHeight * .8 - tl.top) / tl.height)));
}
let raf; addEventListener('scroll', () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(updateTimelineDraw);
}, { passive: true });
updateTimelineDraw();

// timeline + venue
const V = CONFIG.venues, vk = Object.keys(V);
$('#tl').innerHTML = CONFIG.events.map(e => `<li class="rv"><time>${e.date}<small>${e.time}</small></time><div><h3>${e.name}</h3><p>${e.note}</p><a class="loc" href="#venue" data-v="${e.venue}">${V[e.venue].name}, ${V[e.venue].addr}</a></div></li>`).join('');
function showVenue(k) {
  const v = V[k], q = encodeURIComponent(v.q);
  $$('#tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.v === k));
  $('#vinfo').innerHTML = `${v.name}<br>${v.addr}`;
  $('#dir').href = 'https://www.google.com/maps/dir/?api=1&destination=' + q;
  $('#map').src = 'https://maps.google.com/maps?q=' + q + '&output=embed';
}
$('#tabs').innerHTML = vk.map(k => `<button type="button" role="tab" data-v="${k}">${V[k].name}</button>`).join('');
$('#tabs').onclick = e => { const b = e.target.closest('button'); if (b) showVenue(b.dataset.v); };
$('#tl').onclick = e => { const a = e.target.closest('.loc'); if (a) showVenue(a.dataset.v); };
showVenue(vk[0]);
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .3 });
$$('.rv').forEach(el => io.observe(el));

// cursor glow + hero parallax
const glow = $('#glow');
addEventListener('pointermove', e => {
  glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  if (!calm) $('.bg').style.transform = `translate(${(e.clientX / innerWidth - .5) * -24}px,${(e.clientY / innerHeight - .5) * -16}px)`;
}, { passive: true });

// falling petals
if (!calm) {
  const c = $('#petals'), x = c.getContext('2d'), D = Math.min(devicePixelRatio || 1, 2); let W, H;
  const rs = () => { W = c.width = innerWidth * D; H = c.height = innerHeight * D; }; rs(); addEventListener('resize', rs);
  const P = Array.from({ length: 26 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (6 + Math.random() * 9) * D,
    s: .4 + Math.random() * .9, w: Math.random() * 6.28, v: .01 + Math.random() * .02, a: Math.random() * 6.28,
    c: Math.random() < .7 ? '#f2c4a4' : '#fffaf5', o: .5 + Math.random() * .4 }));
  (function f() {
    x.clearRect(0, 0, W, H);
    for (const p of P) {
      p.y += p.s * D; p.w += p.v; p.x += Math.sin(p.w) * .8 * D; p.a += .01;
      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = p.o; x.fillStyle = p.c;
      x.beginPath(); x.ellipse(0, 0, p.r, p.r * .55, 0, 0, 6.28); x.fill(); x.restore();
    }
    requestAnimationFrame(f);
  })();
}

// personal greeting: yoursite.com/?to=Sharma%20Family
const to = new URLSearchParams(location.search).get('to');
if (to) $('#guest').textContent = 'Dear ' + to.slice(0, 40);
if (CONFIG.families) $('.to').textContent = CONFIG.families;

// 3D tilt on photos, magnetic buttons, tap hearts
if (!calm && matchMedia('(hover:hover)').matches) {
  $$('.slide figure').forEach(f => {
    f.addEventListener('pointermove', e => {
      const r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      f.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    f.addEventListener('pointerleave', () => f.style.transform = '');
  });
  $$('.btn').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    b.addEventListener('pointerleave', () => b.style.transform = '');
  });
}
addEventListener('pointerdown', e => {
  if (calm || e.target.closest('button,a,input,select,label')) return;
  const h = document.createElement('span'); h.className = 'heart'; h.textContent = '♥';
  h.style.left = e.clientX + 'px'; h.style.top = e.clientY + 'px';
  document.body.append(h); setTimeout(() => h.remove(), 1400);
});
