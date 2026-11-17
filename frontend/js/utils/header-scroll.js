/**
 * Ao dar scroll na página, marca o header com a classe "bb-header--scrolled".
 * O CSS (ver .bb-header__nav-wrap / .bb-nav__user / .bb-header--scrolled em
 * input.css) cuida de encolher os links de navegação e as infos do usuário,
 * fazendo o título "BestBuddy" deslizar suavemente para o centro da barra.
 *
 * Chamado tanto por Navigation.js (app autenticado) quanto por
 * AuthHeader.js (telas de login/cadastro), então funciona em todas as
 * páginas do site.
 */
function bbInitHeaderScrollEffect(headerEl) {
  if (!headerEl) return;

  const THRESHOLD = 40;
  let ticking = false;
  let lastScrolled = null;

  function update() {
    ticking = false;
    const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const isScrolled = currentY > THRESHOLD;
    if (isScrolled !== lastScrolled) {
      lastScrolled = isScrolled;
      headerEl.classList.toggle("bb-header--scrolled", isScrolled);
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  update();
}
