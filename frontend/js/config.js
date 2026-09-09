/**
 * Configuração central do front-end.
 *
 * USE_MOCKS controla se os services usam dados fake (js/mocks/*) ou
 * batem no backend real. Deixe true enquanto o backend não estiver
 * pronto/corrigido — todas as telas funcionam só com o front.
 *
 * Quando o backend estiver ok, mude para false e ajuste API_BASE_URL.
 */
window.BB_CONFIG = {
  USE_MOCKS: false, // Integrado à API Django real por padrão
  API_BASE_URL: "http://127.0.0.1:8000/api",
  MOCK_LATENCY_MS: 0,
  GOOGLE_MAPS_API_KEY: "",
};
