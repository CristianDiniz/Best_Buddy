/**
 * Wrapper fino sobre localStorage para dados de sessão.
 * Centralizado aqui para facilitar trocar a estratégia depois
 * (ex.: cookies httpOnly) sem mexer nos services.
 */
const BB_STORAGE_KEYS = {
  ACCESS_TOKEN: "bb_access_token",
  REFRESH_TOKEN: "bb_refresh_token",
  USER: "bb_user",
};

const bbStorage = {
  setSession({ access, refresh, user }) {
    if (access) localStorage.setItem(BB_STORAGE_KEYS.ACCESS_TOKEN, access);
    if (refresh) localStorage.setItem(BB_STORAGE_KEYS.REFRESH_TOKEN, refresh);
    if (user) localStorage.setItem(BB_STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getAccessToken() {
    return localStorage.getItem(BB_STORAGE_KEYS.ACCESS_TOKEN);
  },

  getUser() {
    const raw = localStorage.getItem(BB_STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return Boolean(this.getAccessToken());
  },

  clearSession() {
    localStorage.removeItem(BB_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(BB_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(BB_STORAGE_KEYS.USER);
  },
};
