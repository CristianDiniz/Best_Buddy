const communityService = {
  async listNews() {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay([...(window.BB_MOCK_NEWS || [])]);
    }
    return bbClient.get("/comunidade/noticias/");
  },

  async listMissingAnimals() {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay([...(window.BB_MOCK_MISSING_ANIMALS || [])]);
    }
    // Consome a tabela unificada Animal filtrada por tipo_servico=PERDIDO
    return bbClient.get("/animais/?tipo_servico=PERDIDO");
  },

  async reportMissingAnimal(payload) {
    const body = {
      tipo_servico: "PERDIDO",
      status: "PERDIDO",
      ...payload,
    };
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      const novo = { id: Date.now(), created_at: new Date().toISOString(), ...body };
      if (!window.BB_MOCK_MISSING_ANIMALS) window.BB_MOCK_MISSING_ANIMALS = [];
      window.BB_MOCK_MISSING_ANIMALS.unshift(novo);
      return bbMockDelay(novo);
    }
    return bbClient.post("/animais/", body);
  },
};
