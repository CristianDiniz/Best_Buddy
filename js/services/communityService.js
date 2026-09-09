/**
 * O backend Django (Best_Buddy) ainda não tem uma app de Comunidade —
 * não existem rotas /comunidade/* implementadas (ver API_CONTRACT.md).
 * Por isso esse service continua 100% mockado, independente de
 * BB_CONFIG.USE_MOCKS. Quando o backend ganhar essa app, é só replicar
 * o padrão usado em animalService/adoptionService aqui.
 */
const communityService = {
  async listNews() {
    return bbMockDelay([...BB_MOCK_NEWS]);
  },

  async listPosts() {
    return bbMockDelay([...BB_MOCK_COMMUNITY_POSTS]);
  },

  async listMissingAnimals() {
    return bbMockDelay([...BB_MOCK_MISSING_ANIMALS]);
  },

  async reportMissingAnimal(payload) {
    const novo = { id: Date.now(), created_at: new Date().toISOString(), ...payload };
    BB_MOCK_MISSING_ANIMALS.unshift(novo);
    return bbMockDelay(novo);
  },
};
