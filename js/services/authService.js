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
    // O backend (POST /token/) só devolve os tokens JWT, sem dados de
    // perfil (não existe endpoint "/me"). Guardamos um usuário mínimo
    // a partir do que já temos no formulário, só para exibir algo
    // (nome/inicial) na navegação.
    const user = { email, nome: email.split("@")[0] };
    return { access: data.access, refresh: data.refresh, user };
  },

  async register(payload) {
    if (window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({ access: "mock-access-token", refresh: "mock-refresh-token" });
    }
    return bbClient.post("/usuarios/register/", payload, { auth: false });
  },

  // Backend ainda não implementa recuperação de senha (não existe rota
  // /usuarios/password-reset/). Mantido mockado até essa API existir.
  async requestPasswordReset(email) {
    return bbMockDelay({ sent: true });
  },

  async confirmPasswordReset({ email, pin, password }) {
    if (pin === "0000") return bbMockError("PIN inválido.", 400);
    return bbMockDelay({ reset: true });
  },

  logout() {
    bbStorage.clearSession();
    window.location.href = "/pages/auth/login.html";
  },
};
