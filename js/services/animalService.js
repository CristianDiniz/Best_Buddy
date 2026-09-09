const animalService = {
  async list() {
    if (window.BB_CONFIG.USE_MOCKS) {
      return bbMockDelay([...BB_MOCK_ANIMALS]);
    }
    return bbClient.get("/animais/");
  },

  async getById(id) {
    if (window.BB_CONFIG.USE_MOCKS) {
      const animal = BB_MOCK_ANIMALS.find((a) => String(a.id) === String(id));
      if (!animal) return bbMockError("Animal não encontrado.", 404);
      return bbMockDelay(animal);
    }
    return bbClient.get(`/animais/${id}/`);
  },

  async create(payload) {
    if (window.BB_CONFIG.USE_MOCKS) {
      const newAnimal = { id: Date.now(), ...payload };
      BB_MOCK_ANIMALS.unshift(newAnimal);
      return bbMockDelay(newAnimal);
    }
    return bbClient.post("/animais/", payload);
  },
};
