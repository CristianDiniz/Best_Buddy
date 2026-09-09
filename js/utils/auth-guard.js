/**
 * Inclua este script nas páginas que exigem login.
 * Se não houver sessão, redireciona para o login.
 */
(function bbAuthGuard() {
  if (!bbStorage.isAuthenticated()) {
    const next = encodeURIComponent(window.location.pathname);
    window.location.href = `/pages/auth/login.html?next=${next}`;
  }
})();
