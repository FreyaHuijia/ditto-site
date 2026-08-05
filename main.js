/* ============================================================
   DITTO — shared interactions
   ============================================================ */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- nav: scrolled state + mobile toggle ---- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  /* ---- scroll reveal ---- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add('in'));
  }

  /* ---- hero: protagonist follows the cursor ---- */
  const hero = document.querySelector('.hero');
  const tilt = document.querySelector('.figure-tilt');
  if (hero && tilt && !reduce) {
    let raf = null, tx = 0, ty = 0, cx = 0, cy = 0;
    const MAXR = 12;   // deg
    const MAXT = 22;   // px
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;   // -1..1
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
    function loop() {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      tilt.style.transform =
        `rotateY(${cx * MAXR}deg) rotateX(${-cy * MAXR}deg) translate(${cx * MAXT}px,${cy * MAXT}px)`;
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(loop);
      else raf = null;
    }
  }

  /* ---- hero chat launcher ---- */
  const box = document.querySelector('.chatbox');
  if (box) {
    const input = box.querySelector('input');
    const hint = box.querySelector('.typed-hint');
    const go = (q) => {
      const url = 'chat.html' + (q && q.trim() ? '?q=' + encodeURIComponent(q.trim()) : '');
      window.location.href = url;
    };
    box.addEventListener('click', () => input && input.focus());
    if (input) {
      input.addEventListener('focus', () => box.classList.add('focus'));
      input.addEventListener('blur', () => box.classList.remove('focus'));
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(input.value); });
    }
    const sendBtn = box.querySelector('.send-btn');
    if (sendBtn) sendBtn.addEventListener('click', (e) => { e.stopPropagation(); go(input ? input.value : ''); });

    /* rotating typed prompts in the placeholder hint */
    if (hint && !reduce) {
      const prompts = [
        'Tell me something to calm me down…',
        'I had a rough day — can we just talk?',
        'Keep me company for a while',
        'Write a note to someone I miss',
        'What should I make for dinner tonight?',
        'Explain why the sky is green'
      ];
      let pi = 0, ci = 0, deleting = false;
      const cur = '<span class="cursor">▍</span>';
      function tick() {
        if (box.classList.contains('focus')) { hint.innerHTML = ''; setTimeout(tick, 400); return; }
        const full = prompts[pi];
        ci += deleting ? -1 : 1;
        hint.innerHTML = full.slice(0, ci) + cur;
        let delay = deleting ? 34 : 62;
        if (!deleting && ci === full.length) { deleting = false; delay = 1700; deleting = true; }
        else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % prompts.length; delay = 320; }
        setTimeout(tick, delay);
      }
      tick();
    } else if (hint) {
      hint.textContent = 'Ask Ditto anything…';
    }
  }

  /* ---- pills -> chat ---- */
  document.querySelectorAll('.pill[data-q]').forEach((p) => {
    p.addEventListener('click', () => {
      window.location.href = 'chat.html?q=' + encodeURIComponent(p.dataset.q);
    });
  });
})();
