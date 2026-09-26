const animalService = {
  async list(params = {}) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      let items = [...(window.BB_MOCK_ANIMALS || [])];
      if (params.tipo_servico) {
        items = items.filter((a) => (a.tipo_servico || "ADOCAO") === params.tipo_servico);
      }
      if (params.cidade) {
        items = items.filter((a) => (a.cidade || "").toLowerCase().includes(params.cidade.toLowerCase()));
      }
      return bbMockDelay(items);
    }
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/animais/?${query}` : "/animais/";
    return bbClient.get(endpoint);
  },

  async getById(id) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      const animal = (window.BB_MOCK_ANIMALS || []).find((a) => String(a.id) === String(id));
      if (!animal) return bbMockError("Animal não encontrado.", 404);
      return bbMockDelay(animal);
    }
    return bbClient.get(`/animais/${id}/`);
  },

  async create(payload) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      const newAnimal = { id: Date.now(), ...payload };
      if (!window.BB_MOCK_ANIMALS) window.BB_MOCK_ANIMALS = [];
      window.BB_MOCK_ANIMALS.unshift(newAnimal);
      return bbMockDelay(newAnimal);
    }
    return bbClient.post("/animais/", payload);
  },

  async update(id, payload) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      const idx = (window.BB_MOCK_ANIMALS || []).findIndex((a) => String(a.id) === String(id));
      if (idx !== -1) {
        window.BB_MOCK_ANIMALS[idx] = { ...window.BB_MOCK_ANIMALS[idx], ...payload };
        return bbMockDelay(window.BB_MOCK_ANIMALS[idx]);
      }
      return bbMockError("Animal não encontrado.", 404);
    }
    return bbClient.patch(`/animais/${id}/`, payload);
  },

  async delete(id) {
    if (window.BB_CONFIG && window.BB_CONFIG.USE_MOCKS) {
      window.BB_MOCK_ANIMALS = (window.BB_MOCK_ANIMALS || []).filter((a) => String(a.id) !== String(id));
      return bbMockDelay({ success: true });
    }
    return bbClient.delete(`/animais/${id}/`);
  },
};

