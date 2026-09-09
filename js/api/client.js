/**
 * Cliente HTTP fino sobre fetch, usado somente quando
 * BB_CONFIG.USE_MOCKS === false.
 */
class BBApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

/**
 * O DRF, quando a validação de um serializer falha, devolve um objeto
 * tipo { "password": ["Este campo é obrigatório."], "email": [...] }
 * (sem uma chave "detail"). Sem isso, o front mostrava sempre uma
 * mensagem genérica, escondendo o motivo real do erro.
 */
function bbExtractErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data === "object") {
    const parts = Object.entries(data).map(([field, msgs]) => {
      const text = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
      return field === "non_field_errors" ? text : `${field}: ${text}`;
    });
    if (parts.length) return parts.join(" | ");
  }
  return fallback;
}

const bbClient = {
  async request(path, { method = "GET", body, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = bbStorage.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${window.BB_CONFIG.API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkError) {
      throw new BBApiError("Não foi possível conectar ao servidor.", 0, null);
    }

    let data = null;
    try {
      data = await response.json();
    } catch (_) {
      // corpo vazio, ok
    }

    if (!response.ok) {
      throw new BBApiError(
        bbExtractErrorMessage(data, "Ocorreu um erro ao processar sua solicitação."),
        response.status,
        data
      );
    }

    return data;
  },

  get(path, opts) {
    return this.request(path, { ...opts, method: "GET" });
  },
  post(path, body, opts) {
    return this.request(path, { ...opts, method: "POST", body });
  },
  patch(path, body, opts) {
    return this.request(path, { ...opts, method: "PATCH", body });
  },
  delete(path, opts) {
    return this.request(path, { ...opts, method: "DELETE" });
  },
};
