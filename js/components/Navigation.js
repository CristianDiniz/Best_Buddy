/**
 * Renderiza o header + navegação do app autenticado dentro do elemento alvo.
 * activePage: "home" | "community" | "animals" | "adoption"
 */
function bbRenderNavigation(targetSelector, activePage) {
  const user = bbStorage.getUser();
  const initials = user?.nome ? user.nome.trim().charAt(0).toUpperCase() : "U";

  const links = [
    { key: "home", label: "Home", href: "/pages/home/index.html", icon: "🏠" },
    { key: "community", label: "Comunidade", href: "/pages/community/index.html", icon: "👥" },
    { key: "animals", label: "Animais", href: "/pages/animals/index.html", icon: "🐾" },
    { key: "adoption", label: "Adoção", href: "/pages/adoption/create.html", icon: "📋" },
  ];

  const linksHtml = links
    .map(
      (link) => `
      <li>
        <a class="bb-nav__link" href="${link.href}" ${link.key === activePage ? 'aria-current="page"' : ""}>
          <span aria-hidden="true">${link.icon}</span>
          <span>${link.label}</span>
        </a>
      </li>`
    )
    .join("");

  const el = document.querySelector(targetSelector);
  el.innerHTML = `
    <div class="bb-topbar"></div>
    <header class="bb-header">
      <div class="bb-container bb-header__bar bb-header__bar--nav">
        <a href="/pages/home/index.html" class="bb-logo">
          <span class="bb-logo__icon" aria-hidden="true">🐾</span>
          <span class="bb-logo__text bb-logo__text--dark">Best</span><span class="bb-logo__text bb-logo__text--accent">Buddy</span>
        </a>
        <nav aria-label="Navegação principal" class="bb-header__nav-wrap">
          <ul class="bb-nav__links">${linksHtml}</ul>
        </nav>
        <div class="bb-nav__user">
          <span>Olá, ${user?.nome ? user.nome.split(" ")[0] : "visitante"}</span>
          <div class="bb-nav__avatar">${initials}</div>
          <button class="bb-btn bb-btn--secondary" id="bb-logout-btn" type="button">Sair</button>
        </div>
      </div>
    </header>
  `;

  document.getElementById("bb-logout-btn")?.addEventListener("click", () => {
    if (typeof authService !== "undefined" && authService.logout) {
      authService.logout();
    } else {
      bbStorage.clearSession();
      window.location.href = "/pages/auth/login.html";
    }
  });

  bbInitHeaderScrollEffect(el.querySelector(".bb-header"));
}
