(() => {
  const menuButton = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  const progress = document.getElementById('progress');
  const year = document.getElementById('year');
  const curtain = document.querySelector('.view-transition');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const home = document.querySelector('.hero');
  const views = [...document.querySelectorAll('[data-page-view]')];
  const viewIds = ['accueil', ...views.map(view => view.id)];
  let currentView = 'accueil';
  let isSwitching = false;

  if (year) year.textContent = new Date().getFullYear();

  function setActiveView(id, animate = true) {
    if (!viewIds.includes(id)) id = 'accueil';
    if (id === currentView && !isSwitching) return;
    if (isSwitching) return;
    isSwitching = true;
    const apply = () => {
      currentView = id;
      document.body.classList.toggle('is-home', id === 'accueil');
      views.forEach(view => {
        const active = view.id === id;
        view.classList.toggle('active-view', active);
        view.setAttribute('aria-hidden', String(!active));
      });
      document.querySelectorAll('#mainNav a[href^="#"]').forEach(link => {
        if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      history.replaceState(null, '', id === 'accueil' ? location.pathname + location.search : '#' + id);
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      updateProgress();
    };
    if (animate && !reduceMotion && curtain) {
      curtain.classList.remove('play');
      void curtain.offsetWidth;
      curtain.classList.add('play');
      window.setTimeout(() => {
        apply();
        window.setTimeout(() => {
          curtain.classList.remove('play');
          isSwitching = false;
        }, 180);
      }, 390);
    } else {
      apply();
      isSwitching = false;
    }
  }

  function closeMenu() {
    nav?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Ouvrir le menu');
  }

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Ouvrir le menu' : 'Fermer le menu');
    nav?.classList.toggle('open', !open);
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href').slice(1);
      if (!viewIds.includes(id)) return;
      event.preventDefault();
      closeMenu();
      setActiveView(id, true);
    });
  });

  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });

  // Official logo sources may occasionally fail; replace failed images with a clean text mark.
  document.querySelectorAll('.tool img').forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackDone) return;
      img.dataset.fallbackDone = 'true';
      img.classList.add('icon-fallback');
      const name = img.closest('.tool')?.querySelector('span')?.textContent || 'APP';
      const abbreviations = {
        'HTML5':'5','CSS3':'CSS','JavaScript':'JS','PHP':'php','MySQL / SQL':'SQL',
        'Photoshop':'Ps','Illustrator':'Ai','Premiere Pro':'Pr','Canva':'Canva',
        'Sublime Text':'S','ChatGPT':'GPT','Ollama':'O'
      };
      const colors = {'HTML5':'#e34f26','CSS3':'#1572b6','JavaScript':'#b69b00','PHP':'#777bb4','MySQL / SQL':'#4479a1','Photoshop':'#31a8ff','Illustrator':'#ff9a00','Premiere Pro':'#7777d8','Canva':'#00aeb9','Sublime Text':'#ff9800','ChatGPT':'#222','Ollama':'#222'};
      const mark = document.createElement('span');
      mark.className = 'brand-fallback';
      mark.textContent = abbreviations[name] || name.slice(0, 3);
      mark.style.setProperty('--fallback-color', colors[name] || '#333');
      img.insertAdjacentElement('afterend', mark);
    }, { once: true });
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
  });

  // Animate content inside the currently opened view as it enters the viewport.
  const revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(el => el.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
    revealItems.forEach(el => observer.observe(el));
  }

  document.body.classList.add('is-home');
  views.forEach(view => view.setAttribute('aria-hidden', 'true'));
  const initial = location.hash.slice(1);
  if (viewIds.includes(initial) && initial !== 'accueil') setActiveView(initial, false);
  else {
    views.forEach(view => view.classList.remove('active-view'));
    document.body.classList.add('is-home');
  }
  updateProgress();
})();