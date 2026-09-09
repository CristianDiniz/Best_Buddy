/**
 * Configuração central do front-end.
 *
 * USE_MOCKS controla se os services usam dados fake (js/mocks/*) ou
 * batem no backend real (Django, em /backend na raiz do projeto).
 *
 * Já está em false: login, cadastro, listagem/criação de animais e
 * envio de solicitação de adoção usam a API real.
 *
 * Comunidade (notícias/posts/desaparecidos) e recuperação de senha
 * continuam mockados propositalmente — o backend Django ainda não
 * implementa essas rotas (ver API_CONTRACT.md, seção "Divergências
 * conhecidas"). Quando esses endpoints existirem, é só seguir o
 * mesmo padrão usado em animalService/adoptionService.
 */
window.BB_CONFIG = {
  USE_MOCKS: false,
  API_BASE_URL: "http://127.0.0.1:8000/api",
  MOCK_LATENCY_MS: 400, // simula latência de rede pra testar loading states

  /**
   * Chave de API do Google Maps (Maps JavaScript API + Places API
   * habilitadas no Google Cloud Console). Usada pelo mapa de "ONGs
   * próximas" no rodapé (js/components/NearbyOngsMap.js).
   * Sem essa chave, o mapa mostra uma mensagem avisando que falta
   * configurar, em vez de quebrar a página.
   */
  GOOGLE_MAPS_API_KEY: "",
};
