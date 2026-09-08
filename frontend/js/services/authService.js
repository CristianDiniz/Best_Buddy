const authService = {
  async login({ email, password }) {
    if (window.BB_CONFIG.USE_MOCKS) {
      if (email === BB_MOCK_CREDENTIALS.email && password === BB_MOCK_CREDENTIALS.password) {
        const session = { access: "mock-access-token", refresh: "mock-refresh-token", user: BB_MOCK_USER };
        return bbMockDelay(session);
      }
      return bbMockError("Email ou senha inválidos.", 401);
    }
    const data = await bbClient.post("/token/", { email, password }, { auth: false });
    return { access: data.access, refresh: data.refresh, user: data.user || null };
  },

  async register(payload) {
    if (window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({ access: "mock-access-token", refresh: "mock-refresh-token" });
    }
    return bbClient.post("/usuarios/register/", payload, { auth: false });
  },

  async requestPasswordReset(email) {
    if (window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({ sent: true });
    }
    return bbClient.post("/usuarios/password-reset/", { email }, { auth: false });
  },

  async confirmPasswordReset({ email, pin, password }) {
    if (window.BB_CONFIG.USE_MOCKS) {
      if (pin === "0000") return bbMockError("PIN inválido.", 400);
      return bbMockDelay({ reset: true });
    }
    return bbClient.post("/usuarios/password-reset/confirm/", { email, pin, password }, { auth: false });
  },

  logout() {
    bbStorage.clearSession();
    window.location.href = "/pages/auth/login.html";
  },
};
