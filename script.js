(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     Opening hours: the one place to edit them.
     24-hour time as [open, close], or null for a closed day.
     Half hours work too, e.g. [7.5, 15] is 7:30am – 3pm.
     ------------------------------------------------------------------------ */
  const HOURS = {
    mon: [7, 15],
    tue: [7, 15],
    wed: [7, 15],
    thu: [7, 15],
    fri: [7, 15],
    sat: [7, 15],
    sun: [7, 15],
  };

  const TIMEZONE = 'Pacific/Auckland';
  // Window of the day drawn on the hero timeline.
  const TIMELINE = [6, 18];

  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const DAY_NAMES = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
    fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
  };

  const $ = (selector) => document.querySelector(selector);

  /* Time helpers ----------------------------------------------------------- */

  // Current day and time at the café, wherever the visitor is.
  function cafeNow() {
    const date = new Date();
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: TIMEZONE,
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23',
      }).formatToParts(date);
      const get = (type) => parts.find((p) => p.type === type).value;
      return {
        day: DAY_KEYS.indexOf(get('weekday').toLowerCase().slice(0, 3)),
        time: (Number(get('hour')) % 24) + Number(get('minute')) / 60,
      };
    } catch (err) {
      return { day: date.getDay(), time: date.getHours() + date.getMinutes() / 60 };
    }
  }

  // 7 -> "7am", 15 -> "3pm", 7.5 -> "7:30am"
  function formatTime(t) {
    const h = Math.floor(t);
    const m = Math.round((t - h) * 60);
    const suffix = h % 24 < 12 ? 'am' : 'pm';
    const h12 = ((h + 11) % 12) + 1;
    return m ? `${h12}:${String(m).padStart(2, '0')}${suffix}` : `${h12}${suffix}`;
  }

  const formatRange = (hours) => (hours ? `${formatTime(hours[0])} – ${formatTime(hours[1])}` : 'Closed');

  /* Open / closed status --------------------------------------------------- */

  function getStatus(now) {
    const today = HOURS[DAY_KEYS[now.day]];

    if (today && now.time >= today[0] && now.time < today[1]) {
      const closingSoon = today[1] - now.time <= 0.5;
      return {
        open: true,
        text: closingSoon ? `Closing soon · ${formatTime(today[1])}` : `Open now · closes ${formatTime(today[1])}`,
      };
    }

    if (today && now.time < today[0]) {
      return { open: false, text: `Closed · opens ${formatTime(today[0])}` };
    }

    for (let i = 1; i <= 7; i++) {
      const key = DAY_KEYS[(now.day + i) % 7];
      if (HOURS[key]) {
        const when = i === 1 ? 'tomorrow' : DAY_NAMES[key];
        return { open: false, text: `Closed · opens ${formatTime(HOURS[key][0])} ${when}` };
      }
    }

    return { open: false, text: 'Closed' };
  }

  // Groups consecutive days with the same hours: [["Mon–Fri", "7am – 3pm"], …]
  function summariseWeek() {
    const groups = [];
    WEEK.forEach((key) => {
      const label = formatRange(HOURS[key]);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.end = key;
      else groups.push({ start: key, end: key, label });
    });

    if (groups.length === 1) return [['Every day', groups[0].label]];

    const short = (key) => DAY_NAMES[key].slice(0, 3);
    return groups.map((g) => [
      g.start === g.end ? short(g.start) : `${short(g.start)}–${short(g.end)}`,
      g.label,
    ]);
  }

  /* Renderers -------------------------------------------------------------- */

  function renderStatus(now) {
    const el = $('[data-status]');
    if (!el) return;
    const status = getStatus(now);
    el.classList.toggle('is-open', status.open);
    $('[data-status-text]').textContent = status.text;
  }

  function renderTimeline(now) {
    const el = $('[data-timeline]');
    if (!el) return;

    const key = DAY_KEYS[now.day];
    const hours = HOURS[key];
    const [start, end] = TIMELINE;
    const pct = (t) => ((Math.min(Math.max(t, start), end) - start) / (end - start)) * 100;

    let html = '<div class="tl-rail"></div>';

    for (let h = start; h <= end; h++) {
      const major = h % 3 === 0;
      const classes = ['tl-tick', major && 'is-major', h === start && 'is-first', h === end && 'is-last']
        .filter(Boolean)
        .join(' ');
      const label = major ? `<span class="tl-label">${formatTime(h)}</span>` : '';
      html += `<span class="${classes}" style="left:${pct(h)}%">${label}</span>`;
    }

    if (hours) {
      html += `<span class="tl-span" style="left:${pct(hours[0])}%;width:${pct(hours[1]) - pct(hours[0])}%"></span>`;
    }

    if (now.time >= start && now.time <= end) {
      html += `<span class="tl-now" style="left:${pct(now.time)}%"><span class="tl-now-label">Now</span></span>`;
    }

    el.innerHTML = html;

    $('[data-today-name]').textContent = `, ${DAY_NAMES[key]}`;
    $('[data-today-hours]').textContent = hours ? formatRange(hours) : 'Closed today';
  }

  function renderHours(now) {
    const body = $('[data-hours]');
    if (body) {
      const todayKey = DAY_KEYS[now.day];
      body.innerHTML = WEEK.map((key) => {
        const today = key === todayKey;
        return `<tr${today ? ' class="is-today"' : ''}>
          <th scope="row">${DAY_NAMES[key]}${today ? '<span class="visually-hidden"> (today)</span>' : ''}</th>
          <td>${formatRange(HOURS[key])}</td>
        </tr>`;
      }).join('');
    }

    const summary = $('[data-hours-summary]');
    if (summary) {
      summary.innerHTML = summariseWeek()
        .map(([days, range]) => `${days}<br>${range}`)
        .join('<br><br>');
    }
  }

  function render() {
    const now = cafeNow();
    renderStatus(now);
    renderTimeline(now);
    renderHours(now);
  }

  render();
  setInterval(render, 60 * 1000);

  /* Header ----------------------------------------------------------------- */

  const header = $('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Scroll reveal ---------------------------------------------------------- */

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* Footer year ------------------------------------------------------------ */

  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
