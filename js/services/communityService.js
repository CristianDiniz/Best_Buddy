const communityService = {
  async listNews() {
    if (window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay([...BB_MOCK_NEWS]);
    }
    return bbClient.get("/comunidade/noticias/");
  },

  async listPosts() {
    if (window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay([...BB_MOCK_COMMUNITY_POSTS]);
    }
    return bbClient.get("/comunidade/posts/");
  },

  async listMissingAnimals() {
    if (window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay([...BB_MOCK_MISSING_ANIMALS]);
    }
    return bbClient.get("/comunidade/desaparecidos/");
  },

  async reportMissingAnimal(payload) {
    if (window.BB_CONFIG.USE_MOCKS) {
      const novo = { id: Date.now(), created_at: new Date().toISOString(), ...payload };
      BB_MOCK_MISSING_ANIMALS.unshift(novo);
      return bbMockDelay(novo);
    }
    return bbClient.post("/comunidade/desaparecidos/", payload);
  },
};
