const authService = {
  async login({ email, password }) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      if (email === BB_MOCK_CREDENTIALS.email && password === BB_MOCK_CREDENTIALS.password) {
        const session = { access: "mock-access-token", refresh: "mock-refresh-token", user: BB_MOCK_USER };
        return bbMockDelay(session);
      }
      return bbMockError("Email ou senha inválidos.", 401);
    }
    const data = await bbClient.post("/token/", { email, password }, { auth: false });
    const user = data.user || { email, nome: email.split("@")[0] };
    return { access: data.access, refresh: data.refresh, user };
  },

  async register(payload) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({ access: "mock-access-token", refresh: "mock-refresh-token" });
    }
    return bbClient.post("/usuarios/register/", payload, { auth: false });
  },

  async getProfile() {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({
        id: 1,
        email: "usuario@teste.com",
        tipo: "PF",
        nome: "Usuário Teste",
        telefone: "11999998888",
        telefone_validado: true,
      });
    }
    return bbClient.get("/usuarios/perfil/");
  },

  async updateProfile(payload) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay(payload);
    }
    return bbClient.patch("/usuarios/perfil/", payload);
  },

  async alterarEmail({ novo_email, senha_atual }) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({ message: "Código de confirmação enviado." });
    }
    return bbClient.post("/usuarios/alterar-email/", { novo_email, senha_atual });
  },

  async confirmarEmail({ token }) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({ message: "E-mail confirmado com sucesso!" });
    }
    return bbClient.post("/usuarios/confirmar-email/", { token }, { auth: false });
  },

  async alterarSenha({ senha_atual, nova_senha, confirmar_nova_senha }) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({ message: "Senha alterada com sucesso!" });
    }
    return bbClient.post("/usuarios/alterar-senha/", {
      senha_atual,
      nova_senha,
      confirmar_nova_senha,
    });
  },

  async enviarCodigoWhatsApp(telefone) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({ message: "Código enviado via WhatsApp!", codigo_dev: "123456" });
    }
    return bbClient.post("/usuarios/whatsapp/enviar/", { telefone });
  },

  async verificarCodigoWhatsApp({ telefone, codigo }) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({
        message: "WhatsApp verificado com sucesso!",
        telefone,
        telefone_validado: true,
      });
    }
    return bbClient.post("/usuarios/whatsapp/verificar/", { telefone, codigo });
  },

  async recuperarSenha(email) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({ message: "Instruções enviadas para seu e-mail.", token_dev: "mock-token-123" });
    }
    return bbClient.post("/usuarios/recuperar-senha/", { email }, { auth: false });
  },

  async redefinirSenha({ token, nova_senha, confirmar_nova_senha }) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay({ message: "Senha redefinida com sucesso!" });
    }
    return bbClient.post("/usuarios/redefinir-senha/", { token, nova_senha, confirmar_nova_senha }, { auth: false });
  },

  requestPasswordReset(email) {
    return this.recuperarSenha(email);
  },

  confirmPasswordReset({ email, pin, token, password, nova_senha }) {
    const finalToken = token || pin;
    const finalPassword = password || nova_senha;
    return this.redefinirSenha({
      token: finalToken,
      nova_senha: finalPassword,
      confirmar_nova_senha: finalPassword,
    });
  },

  logout() {
    bbStorage.clearSession();
    window.location.href = "/pages/auth/login.html";
  },
};
