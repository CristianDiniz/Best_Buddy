function bbRenderAuthHeader(targetSelector) {
  const el = document.querySelector(targetSelector);
  el.innerHTML = `
    <div class="bb-topbar"></div>
    <header class="bb-header">
      <div class="bb-container bb-header__bar">
        <a href="/pages/home/index.html" class="bb-logo">
          <span class="bb-logo__icon" aria-hidden="true">🐾</span>
          <span class="bb-logo__text bb-logo__text--dark">Best</span><span class="bb-logo__text bb-logo__text--accent">Buddy</span>
        </a>
      </div>
    </header>
  `;

  bbInitHeaderScrollEffect(el.querySelector(".bb-header"));
}
