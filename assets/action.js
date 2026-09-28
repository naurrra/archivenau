(function () {
  const root = document.documentElement;

  // 1. Reveal on scroll 
  const revealEls = document.querySelectorAll('.reveal');
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.1 })
    : null;
  revealEls.forEach(el => (io ? io.observe(el) : el.classList.add('in')));

  // 2. Theme toggle
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    try { const saved = localStorage.getItem('theme'); if (saved) root.dataset.theme = saved; } catch (e) {}
    themeBtn.addEventListener('click', () => {
      const isDark = root.dataset.theme
        ? root.dataset.theme === 'dark'
        : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = isDark ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    });
  }

  // 3. Project filter + pagination
  const grid = document.getElementById('projectGrid');
  const pager = document.getElementById('pagination');
  const filters = document.querySelectorAll('.filter');
  const projects = Array.from(document.querySelectorAll('.project'));
  const perPage = grid ? parseInt(grid.dataset.perPage, 10) || 6 : 6;
  let currentCat = 'all';
  let currentPage = 1;

  function matches(card) {
    if (currentCat === 'all') return true;
    return (card.dataset.cat || '').split(' ').includes(currentCat);
  }

  function makeBtn(label, page, opts = {}) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'page-btn' + (opts.active ? ' active' : '');
    b.innerHTML = label;
    b.disabled = !!opts.disabled;
    if (opts.aria) b.setAttribute('aria-label', opts.aria);
    if (opts.active) b.setAttribute('aria-current', 'page');
    b.addEventListener('click', () => {
      currentPage = page;
      render();
      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return b;
  }

  function render() {
    const visible = projects.filter(matches);
    const totalPages = Math.max(1, Math.ceil(visible.length / perPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * perPage;
    const end = start + perPage;

    projects.forEach(card => card.classList.add('hidden'));
    visible.slice(start, end).forEach(card => {
      card.classList.remove('hidden');
      card.classList.add('in'); // kartu di halaman baru langsung tampil
    });

    if (!pager) return;
    pager.innerHTML = '';
    pager.hidden = totalPages <= 1;
    if (totalPages <= 1) return;

    pager.appendChild(makeBtn('<i class="bi bi-chevron-left"></i>', currentPage - 1,
      { disabled: currentPage === 1, aria: 'Previous page' }));
    for (let p = 1; p <= totalPages; p++) {
      pager.appendChild(makeBtn(String(p), p, { active: p === currentPage, aria: 'Page ' + p }));
    }
    pager.appendChild(makeBtn('<i class="bi bi-chevron-right"></i>', currentPage + 1,
      { disabled: currentPage === totalPages, aria: 'Next page' }));
  }

  filters.forEach(f => {
    f.addEventListener('click', () => {
      filters.forEach(x => x.classList.remove('active'));
      f.classList.add('active');
      currentCat = f.dataset.filter;
      currentPage = 1;
      render();
    });
  });

  render();

  // 4. Tahun di footer
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  
  // 5. Back to top
const toTop = document.getElementById('backToTop');
if (toTop) {
  const toggleToTop = () => toTop.classList.toggle('show', window.scrollY > 400);
  window.addEventListener('scroll', toggleToTop, { passive: true });
  toggleToTop();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
})();